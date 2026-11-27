"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "cn";
import { createContext, useCallback, useContext, useMemo } from "react";

type PopoverAnimationPreset = "none" | "scale" | "fade" | "slideOutside" | "slideInside" | "motion" | "motionBlur";

type PopoverTransitionPreset =
  | "inExpo"
  | "outExpo"
  | "inOutExpo"
  | "anticipate"
  | "quickOut"
  | "overshootOut"
  | "swiftOut"
  | "snappyOut"
  | "in"
  | "out"
  | "inOut"
  | "outIn"
  | "inQuad"
  | "outQuad"
  | "inOutQuad"
  | "inCubic"
  | "outCubic"
  | "inOutCubic"
  | "inQuart"
  | "outQuart"
  | "inOutQuart"
  | "inQuint"
  | "outQuint"
  | "inOutQuint"
  | "inCirc"
  | "outCirc"
  | "inOutCirc"
  | "inOutBase"
  | "none";

const animationPresets: Record<PopoverAnimationPreset, string> = {
  none: "transition-none",
  scale:
    "[transition-property:scale,opacity] [will-change:scale,opacity] data-starting-style:scale-80 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:scale-80",
  fade: "[transition-property:opacity] [will-change:opacity] data-starting-style:opacity-0 data-ending-style:opacity-0",
  slideOutside:
    "[transition-property:translate,opacity] [will-change:translate,opacity] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:translate-y-[10px] data-[side=bottom]:data-ending-style:translate-y-[10px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-starting-style:translate-y-[-10px] data-[side=top]:data-ending-style:translate-y-[-10px] data-[side=top]:data-ending-style:opacity-0 data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-starting-style:translate-x-[-10px] data-[side=left]:data-ending-style:translate-x-[-10px] data-[side=left]:data-ending-style:opacity-0 data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-starting-style:translate-x-[10px] data-[side=right]:data-ending-style:translate-x-[10px] data-[side=right]:data-ending-style:opacity-0 data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-starting-style:translate-x-[-10px] data-[side=inline-start]:data-ending-style:translate-x-[-10px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-starting-style:translate-x-[10px] data-[side=inline-end]:data-ending-style:translate-x-[10px] data-[side=inline-end]:data-ending-style:opacity-0",
  slideInside:
    "[transition-property:translate,opacity] [will-change:translate,opacity] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:translate-y-[-10px] data-[side=bottom]:data-ending-style:translate-y-[-10px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-starting-style:translate-y-[10px] data-[side=top]:data-ending-style:translate-y-[10px] data-[side=top]:data-ending-style:opacity-0 data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-starting-style:translate-x-[10px] data-[side=left]:data-ending-style:translate-x-[10px] data-[side=left]:data-ending-style:opacity-0 data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-starting-style:translate-x-[-10px] data-[side=right]:data-ending-style:translate-x-[-10px] data-[side=right]:data-ending-style:opacity-0 data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-starting-style:translate-x-[10px] data-[side=inline-start]:data-ending-style:translate-x-[10px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-starting-style:translate-x-[-10px] data-[side=inline-end]:data-ending-style:translate-x-[-10px] data-[side=inline-end]:data-ending-style:opacity-0",
  motion:
    "[transition-property:translate,scale,opacity,rotateX,rotateY,transform] [will-change:translate,scale,opacity,rotateX,rotateY,transform] motion-reduce:transition-none motion-reduce:transform-none [transform:perspective(1000px)] data-[side=bottom]:data-starting-style:translate-y-[7px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:scale-[0.26] data-[side=bottom]:data-starting-style:rotate-x-[70deg] data-[side=bottom]:data-ending-style:translate-y-[7px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=bottom]:data-ending-style:scale-[0.26] data-[side=bottom]:data-ending-style:rotate-x-[70deg] data-[side=top]:data-starting-style:translate-y-[7px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-starting-style:scale-[0.26] data-[side=top]:data-starting-style:rotate-x-[70deg] data-[side=top]:data-ending-style:translate-y-[7px] data-[side=top]:data-ending-style:opacity-0 data-[side=top]:data-ending-style:scale-[0.26] data-[side=top]:data-ending-style:rotate-x-[70deg] data-[side=left]:data-starting-style:translate-x-[-7px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-starting-style:scale-[0.26] data-[side=left]:data-starting-style:rotate-y-[-40deg] data-[side=left]:data-ending-style:translate-x-[-7px] data-[side=left]:data-ending-style:opacity-0 data-[side=left]:data-ending-style:scale-[0.26] data-[side=left]:data-ending-style:rotate-y-[-40deg] data-[side=right]:data-starting-style:translate-x-[7px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-starting-style:scale-[0.26] data-[side=right]:data-starting-style:rotate-y-[40deg] data-[side=right]:data-ending-style:translate-x-[7px] data-[side=right]:data-ending-style:opacity-0 data-[side=right]:data-ending-style:scale-[0.26] data-[side=right]:data-ending-style:rotate-y-[40deg] data-[side=inline-start]:data-starting-style:translate-x-[-7px] data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-starting-style:scale-[0.26] data-[side=inline-start]:data-starting-style:rotate-y-[-40deg] data-[side=inline-start]:data-ending-style:translate-x-[-7px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-start]:data-ending-style:scale-[0.26] data-[side=inline-start]:data-ending-style:rotate-y-[-40deg] data-[side=inline-end]:data-starting-style:translate-x-[7px] data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-starting-style:scale-[0.26] data-[side=inline-end]:data-starting-style:rotate-y-[40deg] data-[side=inline-end]:data-ending-style:translate-x-[7px] data-[side=inline-end]:data-ending-style:opacity-0 data-[side=inline-end]:data-ending-style:scale-[0.26] data-[side=inline-end]:data-ending-style:rotate-y-[40deg]",
  motionBlur:
    "[transition-property:translate,scale,opacity,rotateX,rotateY,transform,filter] [will-change:translate,scale,opacity,rotateX,rotateY,transform,filter] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:filter-none [transform:perspective(1000px)] data-starting-style:blur-[9px] data-ending-style:blur-[9px] data-[side=bottom]:data-starting-style:translate-y-[7px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:scale-[0.26] data-[side=bottom]:data-starting-style:rotate-x-[70deg] data-[side=bottom]:data-ending-style:translate-y-[7px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=bottom]:data-ending-style:scale-[0.26] data-[side=bottom]:data-ending-style:rotate-x-[70deg] data-[side=top]:data-starting-style:translate-y-[7px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-starting-style:scale-[0.26] data-[side=top]:data-starting-style:rotate-x-[70deg] data-[side=top]:data-ending-style:translate-y-[7px] data-[side=top]:data-ending-style:opacity-0 data-[side=top]:data-ending-style:scale-[0.26] data-[side=top]:data-ending-style:rotate-x-[70deg] data-[side=left]:data-starting-style:translate-x-[-7px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-starting-style:scale-[0.26] data-[side=left]:data-starting-style:rotate-y-[-40deg] data-[side=left]:data-ending-style:translate-x-[-7px] data-[side=left]:data-ending-style:opacity-0 data-[side=left]:data-ending-style:scale-[0.26] data-[side=left]:data-ending-style:rotate-y-[-40deg] data-[side=right]:data-starting-style:translate-x-[7px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-starting-style:scale-[0.26] data-[side=right]:data-starting-style:rotate-y-[40deg] data-[side=right]:data-ending-style:translate-x-[7px] data-[side=right]:data-ending-style:opacity-0 data-[side=right]:data-ending-style:scale-[0.26] data-[side=right]:data-ending-style:rotate-y-[40deg] data-[side=inline-start]:data-starting-style:translate-x-[-7px] data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-starting-style:scale-[0.26] data-[side=inline-start]:data-starting-style:rotate-y-[-40deg] data-[side=inline-start]:data-ending-style:translate-x-[-7px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-start]:data-ending-style:scale-[0.26] data-[side=inline-start]:data-ending-style:rotate-y-[-40deg] data-[side=inline-end]:data-starting-style:translate-x-[7px] data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-starting-style:scale-[0.26] data-[side=inline-end]:data-starting-style:rotate-y-[40deg] data-[side=inline-end]:data-ending-style:translate-x-[7px] data-[side=inline-end]:data-ending-style:opacity-0 data-[side=inline-end]:data-ending-style:scale-[0.26] data-[side=inline-end]:data-ending-style:rotate-y-[40deg]"
};

const motionReduceClasses =
  "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:[translate:none] motion-reduce:[scale:1] motion-reduce:[rotate:none] motion-reduce:filter-none";

const transitionPresets: Record<PopoverTransitionPreset, string> = {
  inExpo: `duration-[0.35s] ease-[cubic-bezier(0.95,0.05,0.795,0.035)]`,
  outExpo: `duration-[0.35s] ease-[cubic-bezier(0.19,1,0.22,1)]`,
  inOutExpo: `duration-[0.35s] ease-[cubic-bezier(1,0,0,1)]`,
  anticipate: `duration-[0.35s] ease-[cubic-bezier(1,-0.4,0.35,0.95)]`,
  quickOut: `duration-[0.35s] ease-out`,
  overshootOut: `duration-[0.35s] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]`,
  swiftOut: `duration-[0.35s] ease-[cubic-bezier(0.175,0.885,0.32,1.1)]`,
  snappyOut: `duration-[0.35s] ease-[cubic-bezier(0.19,1,0.22,1)]`,
  in: `duration-[0.35s] ease-[cubic-bezier(0.42,0,1,1)]`,
  out: `duration-[0.35s] ease-[cubic-bezier(0,0,0.58,1)]`,
  inOut: `duration-[0.25s] ease-[cubic-bezier(0.42,0,0.58,1)]`,
  outIn: `duration-[0.35s] ease-[cubic-bezier(0.1,0.7,0.9,0.5)]`,
  inQuad: `duration-[0.35s] ease-[cubic-bezier(0.55,0.085,0.68,0.53)]`,
  outQuad: `duration-[0.25s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]`,
  inOutQuad: `duration-[0.32s] ease-[cubic-bezier(0.455,0.03,0.515,0.955)]`,
  inCubic: `duration-[0.35s] ease-[cubic-bezier(0.55,0.055,0.675,0.19)]`,
  outCubic: `duration-[0.35s] ease-[cubic-bezier(0.215,0.61,0.355,1)]`,
  inOutCubic: `duration-[0.35s] ease-[cubic-bezier(0.645,0.045,0.355,1)]`,
  inQuart: `duration-[0.35s] ease-[cubic-bezier(0.895,0.03,0.685,0.22)]`,
  outQuart: `duration-[0.35s] ease-[cubic-bezier(0.165,0.84,0.44,1)]`,
  inOutQuart: `duration-[0.35s] ease-[cubic-bezier(0.77,0,0.175,1)]`,
  inQuint: `duration-[0.35s] ease-[cubic-bezier(0.755,0.05,0.855,0.06)]`,
  outQuint: `duration-[0.35s] ease-[cubic-bezier(0.23,1,0.32,1)]`,
  inOutQuint: `duration-[0.35s] ease-[cubic-bezier(0.86,0,0.07,1)]`,
  inCirc: `duration-[0.35s] ease-[cubic-bezier(0.6,0.04,0.98,0.335)]`,
  outCirc: `duration-[0.35s] ease-[cubic-bezier(0.075,0.82,0.165,1)]`,
  inOutCirc: `duration-[0.35s] ease-[cubic-bezier(0.785,0.135,0.15,0.86)]`,
  inOutBase: `duration-[0.35s] ease-[cubic-bezier(0.25,0.1,0.25,1)]`,
  none: "none"
};

type PopoverBackdropStyle = "dim" | "blur" | "transparent";

type PopoverContextType = {
  backdrop?: PopoverBackdropStyle;
  modal: boolean | "trap-focus";
};

const PopoverContext = createContext<PopoverContextType>({
  backdrop: "transparent",
  modal: false
});

function usePopover() {
  const context = useContext(PopoverContext);
  return context;
}

type PopoverProps<Payload = unknown> = PopoverPrimitive.Root.Props<Payload> & {
  backdrop?: "dim" | "blur" | "transparent";
  /** Prevents closing from outside presses, Escape, and focus loss. */
  dismissible?: boolean;
};

type PopoverOnOpenChange = NonNullable<PopoverPrimitive.Root.Props["onOpenChange"]>;

const Popover = Object.assign(
  function Popover<Payload = unknown>({
    backdrop = "transparent",
    dismissible = true,
    modal = false,
    onOpenChange,
    ...props
  }: PopoverProps<Payload>) {
    const handleOpenChange = useCallback<PopoverOnOpenChange>(
      (nextOpen, eventDetails) => {
        const target = eventDetails.event?.target;
        if (!nextOpen && target instanceof Element && target.closest("[data-slot=lightbox-portal]")) {
          eventDetails.cancel();
          return;
        }

        if (!dismissible && !nextOpen && eventDetails.reason !== "close-press") {
          eventDetails.cancel();
          return;
        }

        onOpenChange?.(nextOpen, eventDetails);
      },
      [dismissible, onOpenChange]
    );
    const contextValue = useMemo(() => {
      return { backdrop, modal };
    }, [backdrop, modal]);

    return (
      <PopoverContext.Provider value={contextValue}>
        <PopoverPrimitive.Root data-slot="popover" modal={modal} onOpenChange={handleOpenChange} {...props} />
      </PopoverContext.Provider>
    );
  },
  { createHandle: PopoverPrimitive.createHandle }
);

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverPortal(props: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

function PopoverBackdrop({ className, ...props }: PopoverPrimitive.Backdrop.Props) {
  const { backdrop = "transparent", modal } = usePopover();

  return (
    <PopoverPrimitive.Backdrop
      data-slot="popover-backdrop"
      className={cn(
        backdrop === "dim" &&
          "fixed inset-0 z-50 bg-black opacity-40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none dark:opacity-60",
        backdrop === "blur" &&
          "fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
        backdrop === "transparent" && modal === true && "fixed inset-0 z-50",
        backdrop === "transparent" && modal !== true && "hidden",
        className
      )}
      {...props}
    />
  );
}

function PopoverClose(props: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverPositioner({
  sideOffset = 4,
  side = "bottom",
  className,
  ...props
}: PopoverPrimitive.Positioner.Props) {
  return (
    <PopoverPortal>
      <PopoverBackdrop />
      <PopoverPrimitive.Positioner
        sideOffset={sideOffset}
        side={side}
        data-slot="popover-positioner"
        className={cn(
          "z-50",
          (side === "inline-end" || side === "inline-start") && "[&_[data-slot=popover-arrow]]:hidden",
          className
        )}
        {...props}
      />
    </PopoverPortal>
  );
}

function PopoverArrow({ className, ...props }: PopoverPrimitive.Arrow.Props) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn(
        "data-[side=bottom]:top-[-9px] data-[side=left]:right-[-14px] data-[side=left]:rotate-90 data-[side=right]:left-[-14px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-9px] data-[side=top]:rotate-180",
        className
      )}
      {...props}
    />
  );
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
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

function PopoverPopup({
  className,
  animationPreset = "scale",
  transitionPreset = "snappyOut",
  reduceMotion = false,
  showArrow = false,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "sideOffset" | "align" | "alignOffset"> & {
    animationPreset?: "none" | "scale" | "fade" | "slideOutside" | "slideInside" | "motion" | "motionBlur";
    transitionPreset?:
      | "inExpo"
      | "outExpo"
      | "inOutExpo"
      | "anticipate"
      | "quickOut"
      | "overshootOut"
      | "swiftOut"
      | "snappyOut"
      | "in"
      | "out"
      | "inOut"
      | "outIn"
      | "inQuad"
      | "outQuad"
      | "inOutQuad"
      | "inCubic"
      | "outCubic"
      | "inOutCubic"
      | "inQuart"
      | "outQuart"
      | "inOutQuart"
      | "inQuint"
      | "outQuint"
      | "inOutQuint"
      | "inCirc"
      | "outCirc"
      | "inOutCirc"
      | "inOutBase"
      | "none";
    reduceMotion?: boolean;
    showArrow?: boolean;
  }) {
  const animation = useMemo(
    () => cn(reduceMotion ? animationPresets.none : animationPresets[animationPreset], motionReduceClasses),
    [animationPreset, reduceMotion]
  );
  const transition = useMemo(
    () => (reduceMotion ? transitionPresets.none : transitionPresets[transitionPreset]),
    [reduceMotion, transitionPreset]
  );

  return (
    <PopoverPositioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
      <PopoverPrimitive.Popup
        data-slot="popover-popup"
        render={
          <div
            key="popover-popup"
            className={cn(
              "pointer-events-auto origin-(--transform-origin) rounded-lg border border-border bg-popover px-4 py-4 text-popover-foreground shadow-md not-[class*='w-']:w-72",
              transition,
              animation,
              className
            )}
          >
            {showArrow && (
              <PopoverArrow>
                <ArrowSvg />
              </PopoverArrow>
            )}
            {children}
          </div>
        }
        {...props}
      />
    </PopoverPositioner>
  );
}

function PopoverViewport({ className, ...props }: PopoverPrimitive.Viewport.Props) {
  return <PopoverPrimitive.Viewport data-slot="popover-viewport" className={className} {...props} />;
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-base font-medium text-popover-foreground", className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("max-w-[35ch] text-sm text-popover-foreground/70", className)}
      {...props}
    />
  );
}

const PopoverContent = PopoverPopup;

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
  PopoverViewport,
  PopoverDescription
};
