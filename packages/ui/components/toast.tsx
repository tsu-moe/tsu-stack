"use client";

import {
  Toast as ToastPrimitive,
  type ToastManager as BaseToastManager,
  type ToastObject as BaseToastObject
} from "@base-ui/react/toast";
import { AlertCircle, CheckCircle2, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";
import { useAnimate, useReducedMotion } from "motion/react";
import * as React from "react";

import { Button } from "@tsu-stack/ui/components/button";
import { cn } from "@tsu-stack/ui/lib/utils";

const toastManager = ToastPrimitive.createToastManager<ToastDataPayload>();
const anchoredToastManager = ToastPrimitive.createToastManager<ToastDataPayload>();

const managerById = new Map<string, BaseToastManager<ToastDataPayload>>();

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle
} as const;

type SwipeDirection = "up" | "down" | "left" | "right";
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export type ToastAction = {
  label: React.ReactNode;
  render?: ToastPrimitive.Action.Props["render"];
  nativeButton?: ToastPrimitive.Action.Props["nativeButton"];
} & Omit<React.ComponentPropsWithoutRef<"button">, "children">;

export type ToastOptions<TData extends ToastDataPayload = ToastDataPayload> = {
  /** Fixed ID for deduplication. Reusing it updates the existing toast. */
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: "default" | "loading" | "success" | "error" | "warning" | "info";
  duration?: number;
  priority?: "low" | "high";
  /** Pass `null` to `toast.update()` to remove an existing action. */
  action?: ToastAction | null;
  data?: TData;
  onClose?: () => void;
  onRemove?: () => void;
  showCloseButton?: boolean;
};

export type AnchoredToastOptions<TData extends ToastDataPayload = ToastDataPayload> = {
  anchor: Element | React.RefObject<Element | null> | null;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  arrow?: boolean;
} & Omit<ToastOptions<TData>, "type">;

type ToastType = "default" | "loading" | "success" | "error" | "warning" | "info";

type PromiseMessage =
  | string
  | {
      title?: React.ReactNode;
      description?: React.ReactNode;
    };
type PromiseMessageOrFn<T> = PromiseMessage | ((value: T) => PromiseMessage);

export type ToastProviderProps = {
  children: React.ReactNode;
  position?: ToastPosition;
  limit?: number;
  timeout?: number;
  container?: ToastPrimitive.Portal.Props["container"];
  closeLabel?: string;
};

export type AnchoredToastProviderProps = {
  children: React.ReactNode;
  limit?: number;
  timeout?: number;
  container?: ToastPrimitive.Portal.Props["container"];
  closeLabel?: string;
};

type ToastDataPayload = {
  actionNativeButton?: ToastPrimitive.Action.Props["nativeButton"];
  actionRender?: ToastPrimitive.Action.Props["render"];
  customJSX?: React.ReactElement;
  showCloseButton?: boolean;
  arrow?: boolean;
  [key: string]: unknown;
};

type ToastData = BaseToastObject<ToastDataPayload>;

function resolveAction(action: ToastAction | null | undefined) {
  if (!action) return undefined;
  const { label, nativeButton, render, ...buttonProps } = action;

  return {
    nativeButton,
    props: { ...buttonProps, children: label },
    render
  };
}

function getSwipeDirection(position: ToastPosition): SwipeDirection[] {
  const vertical: SwipeDirection = position.startsWith("top") ? "up" : "down";
  if (position.includes("center")) return [vertical];
  if (position.includes("left")) return ["left", vertical];
  return ["right", vertical];
}

const TOAST_SURFACE_CLASSES =
  "border border-border/70 shadow-[0_1px_1px_-0.5px_rgb(0_0_0/0.06),0_3px_3px_-1.5px_rgb(0_0_0/0.05)] dark:border-border dark:shadow-[0_1px_1px_-0.5px_rgb(0_0_0/0.18),0_3px_3px_-1.5px_rgb(0_0_0/0.16),inset_0_1px_0_0_rgb(255_255_255/0.02),inset_0_0_0_1px_rgb(255_255_255/0.02)]";

const TOAST_ROOT_CLASSES = [
  "group/toast absolute z-[calc(50-var(--toast-index))] h-(--toast-calc-height) w-full select-none text-popover-foreground [transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s,background-color_.5s] motion-reduce:[transition:opacity_.2s,height_.15s] motion-reduce:transform-none",
  "[--popup-surface:var(--card)]",
  "data-[position*=top]:top-0 data-[position*=top]:right-0 data-[position*=top]:left-0 data-[position*=top]:origin-[50%_calc(50%-50%*min(var(--toast-index,0),1))]",
  "data-[position*=bottom]:right-0 data-[position*=bottom]:bottom-0 data-[position*=bottom]:left-0 data-[position*=bottom]:origin-[50%_calc(50%+50%*min(var(--toast-index,0),1))]",
  "after:absolute after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full",
  "data-[position*=top]:after:bottom-full data-[position*=bottom]:after:top-full",
  "[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))] [--toast-gap:--spacing(3)] [--toast-peek:--spacing(3)] [--toast-scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--toast-shrink:calc(1-var(--toast-scale))]",
  "data-[position*=top]:[--toast-calc-offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
  "data-[position*=bottom]:[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--toast-gap)*-1)+var(--toast-swipe-movement-y))]",
  "data-[position*=top]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek))+(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
  "data-[position*=bottom]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
  "data-limited:opacity-0",
  "data-expanded:h-(--toast-height) data-position:data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]",
  "bg-[color-mix(in_srgb,var(--popup-surface),var(--color-black)_calc(1%*max(0,var(--toast-index,0))))] data-expanded:bg-(--popup-surface)",
  "data-[position*=top]:data-starting-style:transform-[translateY(calc(-100%-var(--toast-inset)))] data-[position*=bottom]:data-starting-style:transform-[translateY(calc(100%+var(--toast-inset)))]",
  "data-ending-style:opacity-0",
  "data-[position*=top]:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(-100%-var(--toast-inset)))]",
  "data-[position*=bottom]:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]",
  "data-ending-style:data-[swipe-direction=down]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
  "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
  "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
  "data-ending-style:data-[swipe-direction=up]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
  "data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
  "data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
  "data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
  "data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 forced-colors:focus-visible:outline-[Highlight]"
].join(" ");

const TOAST_MICROINTERACTION_CLASSES = [
  "h-full w-full rounded-lg motion-reduce:transition-none",
  TOAST_SURFACE_CLASSES
].join(" ");

function resolveAnchor(anchor: Element | React.RefObject<Element | null> | null | undefined) {
  if (!anchor) return undefined;
  const resolved = "current" in anchor ? anchor.current : anchor;
  if (!resolved) return undefined;
  if ("isConnected" in resolved && resolved.isConnected === false) {
    return undefined;
  }
  return resolved;
}

function addTrackedToast(
  manager: BaseToastManager<ToastDataPayload>,
  options: Parameters<BaseToastManager<ToastDataPayload>["add"]>[0]
) {
  const requestedId = typeof options.id === "string" ? options.id : undefined;
  const knownId = requestedId !== undefined && managerById.has(requestedId);
  const toastIdRef: { current: string | undefined } = { current: undefined };
  const originalOnRemove = options.onRemove;
  const trackedOptions = knownId
    ? options
    : {
        ...options,
        onRemove: () => {
          if (toastIdRef.current && managerById.get(toastIdRef.current) === manager) {
            managerById.delete(toastIdRef.current);
          }
          originalOnRemove?.();
        }
      };

  const toastId = manager.add(trackedOptions);
  toastIdRef.current = toastId;
  managerById.set(toastId, manager);
  return toastId;
}

function baseToast(jsx: React.ReactElement): string | undefined;
function baseToast<TData extends ToastDataPayload = ToastDataPayload>(
  jsx: React.ReactElement,
  options: Omit<ToastOptions<TData>, "title" | "description">
): string | undefined;
function baseToast<TData extends ToastDataPayload = ToastDataPayload>(options: ToastOptions<TData>): string | undefined;
function baseToast<TData extends ToastDataPayload = ToastDataPayload>(
  optionsOrJSX: ToastOptions<TData> | React.ReactElement,
  jsxOptions?: Omit<ToastOptions<TData>, "title" | "description">
): string | undefined {
  if (React.isValidElement(optionsOrJSX)) {
    const action = resolveAction(jsxOptions?.action);
    return addTrackedToast(toastManager, {
      ...(jsxOptions?.id && { id: jsxOptions.id }),
      title: "",
      description: "",
      type: jsxOptions?.type ?? "default",
      timeout: jsxOptions?.duration ?? undefined,
      priority: jsxOptions?.priority ?? "low",
      ...(action && { actionProps: action.props }),
      data: {
        customJSX: optionsOrJSX,
        ...(jsxOptions?.data && jsxOptions.data),
        ...(action?.render && { actionRender: action.render }),
        ...(action?.nativeButton !== undefined && {
          actionNativeButton: action.nativeButton
        }),
        showCloseButton: jsxOptions?.showCloseButton ?? true
      },
      ...(jsxOptions?.onClose && { onClose: jsxOptions.onClose }),
      ...(jsxOptions?.onRemove && { onRemove: jsxOptions.onRemove })
    });
  }

  const options = optionsOrJSX as ToastOptions<TData>;
  const action = resolveAction(options.action);
  return addTrackedToast(toastManager, {
    ...(options.id && { id: options.id }),
    title: options.title,
    description: options.description ?? "",
    type: options.type ?? "default",
    timeout: options.duration ?? undefined,
    priority: options.priority ?? "low",
    ...(action && { actionProps: action.props }),
    data: {
      ...options.data,
      ...(action?.render && { actionRender: action.render }),
      ...(action?.nativeButton !== undefined && {
        actionNativeButton: action.nativeButton
      }),
      showCloseButton: options.showCloseButton ?? true
    },
    ...(options.onClose && { onClose: options.onClose }),
    ...(options.onRemove && { onRemove: options.onRemove })
  });
}

const promise = async <T,>(
  promiseToResolve: Promise<T>,
  messages: {
    loading: PromiseMessage;
    success: PromiseMessageOrFn<T>;
    error: PromiseMessageOrFn<Error>;
  }
) => {
  const resolveMessage = <U,>(message: PromiseMessageOrFn<U>, value: U) =>
    typeof message === "function" ? message(value) : message;
  const handledPromise = toastManager.promise(promiseToResolve, {
    loading: messages.loading,
    success: (value: T) => resolveMessage(messages.success, value),
    error: (error: Error) => resolveMessage(messages.error, error)
  });
  void handledPromise.catch(() => undefined);
  return handledPromise;
};

function createTypedToast(type: NonNullable<ToastOptions["type"]>) {
  return <TData extends ToastDataPayload = ToastDataPayload>(
    optionsOrJSX: Omit<ToastOptions<TData>, "type"> | React.ReactElement,
    jsxOptions?: Omit<ToastOptions<TData>, "title" | "description" | "type">
  ) => {
    if (React.isValidElement(optionsOrJSX)) {
      return baseToast(optionsOrJSX, { ...jsxOptions, type });
    }
    return baseToast({ ...optionsOrJSX, type });
  };
}

export const toast = Object.assign(baseToast, {
  success: createTypedToast("success"),
  error: createTypedToast("error"),
  warning: createTypedToast("warning"),
  info: createTypedToast("info"),
  promise,
  dismiss: (toastId?: string) => {
    if (toastId) {
      (managerById.get(toastId) ?? toastManager).close(toastId);
    } else {
      toastManager.close();
      anchoredToastManager.close();
    }
  },
  update: (toastId: string, options: Partial<ToastOptions>) => {
    const updateOptions: Partial<Omit<ToastData, "id">> = {};
    if (options.title !== undefined) updateOptions.title = options.title;
    if (options.description !== undefined) {
      updateOptions.description = options.description;
    }
    if (options.type !== undefined) updateOptions.type = options.type;
    if (options.duration !== undefined) {
      updateOptions.timeout = options.duration;
    }
    if (options.priority !== undefined) {
      updateOptions.priority = options.priority;
    }
    if (options.action !== undefined) {
      const action = resolveAction(options.action);
      updateOptions.actionProps = action?.props;
      updateOptions.data = {
        ...(action?.render && { actionRender: action.render }),
        ...(action?.nativeButton !== undefined && {
          actionNativeButton: action.nativeButton
        })
      };
    }
    if (options.data !== undefined) updateOptions.data = options.data;
    if (options.showCloseButton !== undefined) {
      updateOptions.data = {
        ...(typeof updateOptions.data === "object" && updateOptions.data ? updateOptions.data : {}),
        showCloseButton: options.showCloseButton
      };
    }
    (managerById.get(toastId) ?? toastManager).update(toastId, updateOptions);
  },
  anchored: <TData extends ToastDataPayload = ToastDataPayload>(options: AnchoredToastOptions<TData>) => {
    const anchor = resolveAnchor(options.anchor);
    if (!anchor) {
      return undefined;
    }

    const action = resolveAction(options.action);
    return addTrackedToast(anchoredToastManager, {
      ...(options.id && { id: options.id }),
      title: options.title,
      description: options.description ?? "",
      timeout: options.duration ?? undefined,
      priority: options.priority ?? "low",
      ...(action && { actionProps: action.props }),
      data: {
        ...options.data,
        ...(action?.render && { actionRender: action.render }),
        ...(action?.nativeButton !== undefined && {
          actionNativeButton: action.nativeButton
        }),
        arrow: options.arrow ?? false,
        showCloseButton: options.showCloseButton ?? true
      },
      positionerProps: {
        anchor,
        side: options.side ?? "top",
        sideOffset: options.sideOffset ?? 8,
        align: options.align,
        alignOffset: options.alignOffset
      },
      ...(options.onClose && { onClose: options.onClose }),
      ...(options.onRemove && { onRemove: options.onRemove })
    });
  }
});

function ToastIcon({ type }: { type: ToastType }) {
  const Icon = type === "default" ? null : TOAST_ICONS[type];
  if (!Icon) return null;

  return (
    <div
      data-slot="toast-icon"
      className={cn(
        "mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
        type === "success" && "text-success-foreground",
        type === "error" && "text-error-foreground",
        type === "warning" && "text-warning-foreground",
        type === "info" && "text-info-foreground",
        type === "loading" && "text-muted-foreground"
      )}
    >
      <Icon aria-hidden="true" className={cn(type === "loading" && "animate-spin motion-reduce:animate-none")} />
    </div>
  );
}

function useToastMicrointeraction(toast: ToastData) {
  const type = (toast.type ?? "default") as ToastType;
  const updateKey = toast.updateKey ?? 0;
  const previousToastRef = React.useRef({ type, updateKey });
  const [microinteractionRef, animate] = useAnimate<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    const previousToast = previousToastRef.current;
    const becameError = type === "error" && previousToast.type !== "error";
    const wasUpserted = updateKey > previousToast.updateKey;

    previousToastRef.current = { type, updateKey };

    if (prefersReducedMotion || !microinteractionRef.current || (!becameError && !wasUpserted)) {
      return;
    }

    void animate(
      microinteractionRef.current,
      becameError
        ? { x: [0, -4, 4, -2, 2, 0], y: 0, scale: 1 }
        : { x: 0, y: [0, -3.5, 1, 0], scale: [1, 1.045, 0.985, 1] },
      {
        duration: becameError ? 0.28 : 0.32,
        times: becameError ? undefined : [0, 0.42, 0.72, 1],
        ease: [0.22, 1, 0.36, 1]
      }
    );
  }, [animate, microinteractionRef, prefersReducedMotion, type, updateKey]);

  return microinteractionRef;
}

function StackedToastItem({
  toast: toastItem,
  position,
  swipeDirection,
  closeLabel
}: {
  toast: ToastData;
  position: ToastPosition;
  swipeDirection: SwipeDirection[];
  closeLabel: string;
}) {
  const type = (toastItem.type ?? "default") as ToastType;
  const microinteractionRef = useToastMicrointeraction(toastItem);
  const data = toastItem.data;
  const hasCustomJSX = Boolean(data && "customJSX" in data);
  const showCloseButton = data?.showCloseButton !== false;

  return (
    <ToastPrimitive.Root
      toast={toastItem}
      swipeDirection={swipeDirection}
      data-slot="toast"
      data-position={position}
      className={TOAST_ROOT_CLASSES}
    >
      <div ref={microinteractionRef} data-slot="toast-microinteraction" className={TOAST_MICROINTERACTION_CLASSES}>
        <ToastPrimitive.Content
          data-slot="toast-content"
          className={cn(
            "flex items-start gap-3 overflow-hidden px-3.5 py-3 text-sm",
            "transition-opacity duration-250 motion-reduce:transition-none",
            "data-behind:pointer-events-none data-behind:opacity-0",
            "data-expanded:pointer-events-auto data-expanded:opacity-100"
          )}
        >
          {hasCustomJSX ? (
            <div className="w-full">{data?.customJSX}</div>
          ) : (
            <>
              <ToastIcon type={type} />
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <div className="flex w-full min-w-0 items-start gap-2">
                  <ToastPrimitive.Title
                    data-slot="toast-title"
                    className="min-w-0 flex-1 text-sm leading-5 font-medium"
                  />
                  {showCloseButton ? (
                    <ToastPrimitive.Close
                      data-slot="toast-close"
                      className="hitbox-4 -mt-1 -mr-1 flex size-6 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-md border-none bg-transparent text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 forced-colors:focus-visible:outline-[Highlight]"
                      aria-label={closeLabel}
                    >
                      <X aria-hidden="true" className="size-4" />
                    </ToastPrimitive.Close>
                  ) : null}
                </div>
                <ToastPrimitive.Description
                  data-slot="toast-description"
                  className="w-full text-sm leading-5 text-muted-foreground"
                />
                {toastItem.actionProps ? (
                  <ToastPrimitive.Action
                    data-slot="toast-action"
                    render={data?.actionRender}
                    nativeButton={data?.actionNativeButton}
                    className="hitbox-4 mt-1.5 cursor-pointer touch-manipulation"
                  />
                ) : null}
              </div>
            </>
          )}
        </ToastPrimitive.Content>
      </div>
    </ToastPrimitive.Root>
  );
}

function StackedToasts({ position, closeLabel }: { position: ToastPosition; closeLabel: string }) {
  const { toasts } = ToastPrimitive.useToastManager();
  const swipeDirection = getSwipeDirection(position);

  return (
    <>
      {toasts.map((toastItem) => (
        <StackedToastItem
          key={toastItem.id}
          toast={toastItem as ToastData}
          position={position}
          swipeDirection={swipeDirection}
          closeLabel={closeLabel}
        />
      ))}
    </>
  );
}

function ToastArrowSvg() {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        fill="var(--popover)"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        fill="var(--border)"
      />
    </svg>
  );
}

function AnchoredToastItem({ toast: toastItem, closeLabel }: { toast: ToastData; closeLabel: string }) {
  const microinteractionRef = useToastMicrointeraction(toastItem);
  const data = toastItem.data;
  const showArrow = data?.arrow === true;
  const showCloseButton = data?.showCloseButton !== false;

  return (
    <ToastPrimitive.Positioner toast={toastItem} data-slot="toast-positioner" className="z-50 outline-none">
      <ToastPrimitive.Root
        toast={toastItem}
        data-slot="toast"
        className={cn(
          "relative w-max max-w-[min(24rem,var(--available-width))] origin-(--transform-origin)",
          "transition-[transform,opacity] duration-200 motion-reduce:transform-none motion-reduce:transition-none",
          "data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 forced-colors:focus-visible:outline-[Highlight]"
        )}
        swipeDirection={[]}
      >
        <div
          ref={microinteractionRef}
          data-slot="toast-microinteraction"
          className="relative flex w-full flex-col rounded-lg border border-border bg-popover px-4 py-4 text-popover-foreground shadow-md"
        >
          {showArrow ? (
            <ToastPrimitive.Arrow
              data-slot="toast-arrow"
              className="data-[side=bottom]:top-[-9px] data-[side=left]:right-[-14px] data-[side=left]:rotate-90 data-[side=right]:left-[-14px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-9px] data-[side=top]:rotate-180"
            >
              <ToastArrowSvg />
            </ToastPrimitive.Arrow>
          ) : null}
          <ToastPrimitive.Content data-slot="toast-content" className={cn(showCloseButton && "pe-8")}>
            <ToastPrimitive.Title data-slot="toast-title" className="text-base font-medium text-popover-foreground" />
            <ToastPrimitive.Description
              data-slot="toast-description"
              className="max-w-[35ch] text-sm text-popover-foreground/70 [&:not(:first-child)]:mt-1"
            />
            {toastItem.actionProps ? (
              <ToastPrimitive.Action
                data-slot="toast-action"
                render={data?.actionRender}
                nativeButton={data?.actionNativeButton}
                className="hitbox-4 mt-1.5 w-fit cursor-pointer touch-manipulation"
              />
            ) : null}
          </ToastPrimitive.Content>
          {showCloseButton ? (
            <ToastPrimitive.Close
              data-slot="toast-close"
              aria-label={closeLabel}
              className="absolute end-2 top-2 text-muted-foreground"
              render={<Button size="icon-sm" variant="ghost" />}
            >
              <X aria-hidden="true" className="size-4" />
            </ToastPrimitive.Close>
          ) : null}
        </div>
      </ToastPrimitive.Root>
    </ToastPrimitive.Positioner>
  );
}

function AnchoredToasts({ closeLabel }: { closeLabel: string }) {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <>
      {toasts.map((toastItem) => {
        const toastData = toastItem as ToastData;
        if (!toastData.positionerProps?.anchor) return null;
        return <AnchoredToastItem key={toastItem.id} toast={toastData} closeLabel={closeLabel} />;
      })}
    </>
  );
}

export function ToastProvider({
  children,
  position = "bottom-right",
  limit = 3,
  timeout = 5000,
  container,
  closeLabel = "Close notification"
}: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider limit={limit} timeout={timeout} toastManager={toastManager}>
      {children}
      <ToastPrimitive.Portal data-slot="toast-portal" container={container}>
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          data-position={position}
          className={cn(
            "fixed z-50 flex w-[calc(100%-var(--toast-inset)*2)] max-w-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 sm:max-w-[360px] forced-colors:focus-visible:outline-[Highlight]",
            "[--toast-inset:1rem]",
            "data-[position*=bottom]:bottom-(--toast-inset) data-[position*=top]:top-(--toast-inset)",
            "data-[position*=left]:left-(--toast-inset) data-[position*=right]:right-(--toast-inset)",
            "data-[position*=center]:left-1/2 data-[position*=center]:-translate-x-1/2"
          )}
        >
          <StackedToasts position={position} closeLabel={closeLabel} />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

export function AnchoredToastProvider({
  children,
  limit = 5,
  timeout = 2000,
  container,
  closeLabel = "Close notification"
}: AnchoredToastProviderProps) {
  return (
    <ToastPrimitive.Provider limit={limit} timeout={timeout} toastManager={anchoredToastManager}>
      {children}
      <ToastPrimitive.Portal data-slot="toast-portal" container={container}>
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          className="outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 forced-colors:focus-visible:outline-[Highlight]"
        >
          <AnchoredToasts closeLabel={closeLabel} />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
