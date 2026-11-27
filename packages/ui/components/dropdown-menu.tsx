"use client";

import { Menu as DropdownMenuPrimitive } from "@base-ui/react/menu";
import { cn } from "cn";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { createContext, useContext, useMemo, type ReactNode } from "react";

type DropdownMenuAnimationPreset = "none" | "scale" | "fade" | "slideOutside" | "slideInside" | "motion" | "motionBlur";

type DropdownMenuTransitionPreset =
  | "inExpo"
  | "outExpo"
  | "inOutExpo"
  | "anticipate"
  | "quickOut"
  | "overshootOut"
  | "swiftOut"
  | "snappyOut";

type DropdownMenuBackdrop = "dim" | "blur" | "transparent";

const animationPresets: Record<DropdownMenuAnimationPreset, string> = {
  none: "transition-none",
  scale:
    "[transition-property:scale,opacity] [will-change:scale,opacity] data-starting-style:scale-80 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:scale-80",
  fade: "[transition-property:opacity] [will-change:opacity] data-starting-style:opacity-0 data-ending-style:opacity-0",
  slideOutside:
    "[transition-property:translate,opacity] [will-change:translate,opacity] data-[side=bottom]:data-starting-style:translate-y-[10px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:translate-y-[10px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=top]:data-starting-style:translate-y-[-10px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-ending-style:translate-y-[-10px] data-[side=top]:data-ending-style:opacity-0 data-[side=left]:data-starting-style:translate-x-[-10px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-ending-style:translate-x-[-10px] data-[side=left]:data-ending-style:opacity-0 data-[side=right]:data-starting-style:translate-x-[10px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-ending-style:translate-x-[10px] data-[side=right]:data-ending-style:opacity-0",
  slideInside:
    "[transition-property:translate,opacity] [will-change:translate,opacity] data-[side=bottom]:data-starting-style:translate-y-[-10px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:translate-y-[-10px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=top]:data-starting-style:translate-y-[10px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-ending-style:translate-y-[10px] data-[side=top]:data-ending-style:opacity-0 data-[side=left]:data-starting-style:translate-x-[10px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-ending-style:translate-x-[10px] data-[side=left]:data-ending-style:opacity-0 data-[side=right]:data-starting-style:translate-x-[-10px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-ending-style:translate-x-[-10px] data-[side=right]:data-ending-style:opacity-0",
  motion:
    "[transition-property:translate,scale,opacity,rotateX,rotateY,transform] [will-change:translate,scale,opacity,rotateX,rotateY,transform] motion-reduce:transition-none motion-reduce:transform-none [transform:perspective(1000px)] data-[side=bottom]:data-starting-style:translate-y-[7px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:scale-[0.26] data-[side=bottom]:data-starting-style:rotate-x-[70deg] data-[side=bottom]:data-ending-style:translate-y-[7px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=bottom]:data-ending-style:scale-[0.26] data-[side=bottom]:data-ending-style:rotate-x-[70deg]",
  motionBlur:
    "[transition-property:translate,scale,opacity,rotateX,rotateY,transform,filter] [will-change:translate,scale,opacity,rotateX,rotateY,transform,filter] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:filter-none [transform:perspective(1000px)] data-starting-style:blur-[9px] data-ending-style:blur-[9px] data-[side=bottom]:data-starting-style:translate-y-[7px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:scale-[0.26] data-[side=bottom]:data-starting-style:rotate-x-[70deg] data-[side=bottom]:data-ending-style:translate-y-[7px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=bottom]:data-ending-style:scale-[0.26] data-[side=bottom]:data-ending-style:rotate-x-[70deg]"
};

const motionReduceClasses =
  "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:[translate:none] motion-reduce:[scale:1] motion-reduce:[rotate:none] motion-reduce:filter-none";

const dropdownMenuItemState =
  "transform-gpu motion-reduce:transform-none motion-reduce:transition-none active:scale-98 data-disabled:scale-100 [transition:scale_100ms,background-color_200ms,border-color_200ms,color_200ms] [transition-timing-function:cubic-bezier(.6,.04,.98,.335)] hover:border-border/30 hover:bg-accent hover:text-accent-foreground active:border-border/30 active:bg-accent/80 active:text-accent-foreground";

const transitionPresets: Record<DropdownMenuTransitionPreset, string> = {
  inExpo: "duration-[0.35s] ease-[cubic-bezier(0.95,0.05,0.795,0.035)]",
  outExpo: "duration-[0.35s] ease-[cubic-bezier(0.19,1,0.22,1)]",
  inOutExpo: "duration-[0.35s] ease-[cubic-bezier(1,0,0,1)]",
  anticipate: "duration-[0.35s] ease-[cubic-bezier(1,-0.4,0.35,0.95)]",
  quickOut: "duration-[0.35s] ease-out",
  overshootOut: "duration-[0.35s] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
  swiftOut: "duration-[0.35s] ease-[cubic-bezier(0.175,0.885,0.32,1.1)]",
  snappyOut: "duration-[0.35s] ease-[cubic-bezier(0.19,1,0.22,1)]"
};

const DropdownMenuContext = createContext<{ backdrop: DropdownMenuBackdrop }>({
  backdrop: "transparent"
});

const DropdownMenuRadioGroupContext = createContext<{ activeIcon?: ReactNode }>({});

type DropdownMenuPositionerProps = Pick<
  DropdownMenuPrimitive.Positioner.Props,
  | "align"
  | "alignOffset"
  | "side"
  | "sideOffset"
  | "anchor"
  | "positionMethod"
  | "collisionBoundary"
  | "collisionPadding"
  | "sticky"
  | "arrowPadding"
  | "disableAnchorTracking"
  | "collisionAvoidance"
>;

function DropdownMenu({
  backdrop = "transparent",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root> & {
  backdrop?: "dim" | "blur" | "transparent";
}) {
  const contextValue = useMemo(() => {
    return { backdrop };
  }, [backdrop]);

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuPortal(props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({
  render = <button aria-label="Open menu" type="button" />,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" render={render} {...props} />;
}

function DropdownMenuBackdrop({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Backdrop>) {
  const { backdrop } = useContext(DropdownMenuContext);

  return (
    <DropdownMenuPrimitive.Backdrop
      className={cn(
        backdrop === "dim" &&
          "fixed inset-0 z-50 bg-black opacity-40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none dark:opacity-60",
        backdrop === "blur" &&
          "fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
        backdrop === "transparent" && "hidden",
        className
      )}
      data-slot="dropdown-menu-backdrop"
      {...props}
    />
  );
}

function DropdownMenuArrow(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        className="fill-popover"
        d="M9.664 2.602 4.808 6.973A3.946 3.946 0 0 1 2.132 8H0v2h20V8h-1.465a3.946 3.946 0 0 1-2.675-1.027l-4.857-4.371a1 1 0 0 0-1.339 0Z"
      />
      <path
        className="fill-border/70"
        d="m10.333 3.345-4.856 4.37A4.946 4.946 0 0 1 2.132 9H0V8h2.132c.988 0 1.941-.366 2.676-1.027l4.856-4.37a1 1 0 0 1 1.34 0l4.856 4.37A3.946 3.946 0 0 0 18.535 8H20v1h-1.465a4.946 4.946 0 0 1-3.345-1.285l-4.857-4.37Z"
      />
    </svg>
  );
}

function DropdownMenuContent({
  className,
  children,
  animationPreset = "scale",
  transitionPreset = "snappyOut",
  reduceMotion = false,
  showArrow = false,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  anchor,
  positionMethod,
  collisionBoundary,
  collisionPadding,
  sticky,
  arrowPadding,
  disableAnchorTracking,
  collisionAvoidance,
  positionerClassName,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Popup> &
  DropdownMenuPositionerProps & {
    animationPreset?: "none" | "scale" | "fade" | "slideOutside" | "slideInside" | "motion" | "motionBlur";
    transitionPreset?:
      | "inExpo"
      | "outExpo"
      | "inOutExpo"
      | "anticipate"
      | "quickOut"
      | "overshootOut"
      | "swiftOut"
      | "snappyOut";
    reduceMotion?: boolean;
    showArrow?: boolean;
    positionerClassName?: string;
  }) {
  const animation = useMemo(
    () => cn(reduceMotion ? animationPresets.none : animationPresets[animationPreset], motionReduceClasses),
    [animationPreset, reduceMotion]
  );
  const transition = useMemo(
    () => (reduceMotion ? animationPresets.none : transitionPresets[transitionPreset]),
    [reduceMotion, transitionPreset]
  );

  return (
    <DropdownMenuPortal>
      <DropdownMenuBackdrop />
      <DropdownMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        arrowPadding={arrowPadding}
        className={cn("z-50 [--item-block-padding:6px] [--item-inline-padding:8px]", positionerClassName)}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
      >
        <DropdownMenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          render={
            <div
              className={cn(
                "pointer-events-auto w-[max(var(--anchor-width),226px)] origin-(--transform-origin) rounded-[12px] border border-border bg-popover p-1 text-popover-foreground shadow-md data-ending-style:pointer-events-none",
                transition,
                animation,
                className
              )}
            >
              {showArrow && (
                <DropdownMenuPrimitive.Arrow
                  className="data-[side=bottom]:top-[-9px] data-[side=left]:right-[-14px] data-[side=left]:rotate-90 data-[side=right]:left-[-14px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-9px] data-[side=top]:rotate-180"
                  data-slot="dropdown-menu-arrow"
                >
                  <DropdownMenuArrow />
                </DropdownMenuPrimitive.Arrow>
              )}
              {children}
            </div>
          }
          {...props}
        />
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.GroupLabel>) {
  return (
    <DropdownMenuPrimitive.GroupLabel
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      data-slot="dropdown-menu-group-label"
      {...props}
    />
  );
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      data-slot="dropdown-menu-label"
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        dropdownMenuItemState,
        "relative flex cursor-pointer items-center gap-2 rounded-[10px] border-[0.5px] border-transparent px-(--item-inline-padding) py-(--item-block-padding) text-sm outline-hidden select-none data-highlighted:z-0 data-highlighted:border-border/30 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(
        dropdownMenuItemState,
        "relative flex cursor-pointer items-center gap-2 rounded-[10px] border-[0.5px] border-transparent px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:border-border/30 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.CheckboxItemIndicator>
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  activeIcon,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup> & {
  activeIcon?: ReactNode;
}) {
  const contextValue = useMemo(() => {
    return { activeIcon };
  }, [activeIcon]);

  return (
    <DropdownMenuRadioGroupContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
    </DropdownMenuRadioGroupContext.Provider>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const { activeIcon } = useContext(DropdownMenuRadioGroupContext);

  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        dropdownMenuItemState,
        "relative flex cursor-pointer items-center gap-2 rounded-[10px] border-[0.5px] border-transparent px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:border-border/30 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="dropdown-menu-radio-item"
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.RadioItemIndicator>
          {activeIcon ?? <CircleIcon className="size-2 fill-current" />}
        </DropdownMenuPrimitive.RadioItemIndicator>
      </span>
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-[0.5px] bg-border/30", className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      data-slot="dropdown-menu-shortcut"
      {...props}
    />
  );
}

function DropdownMenuSub(props: DropdownMenuPrimitive.SubmenuRoot.Props) {
  return <DropdownMenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({ className, children, ...props }: DropdownMenuPrimitive.SubmenuTrigger.Props) {
  return (
    <DropdownMenuPrimitive.SubmenuTrigger
      className={cn(
        dropdownMenuItemState,
        "relative flex cursor-pointer items-center gap-2 rounded-[10px] border-[0.5px] border-transparent px-(--item-inline-padding) py-(--item-block-padding) text-sm outline-hidden select-none data-highlighted:border-border/30 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-popup-open:border-border/30 data-popup-open:bg-accent data-popup-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="dropdown-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  align = "start",
  alignOffset = 0,
  side = "right",
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Popup> &
  Pick<DropdownMenuPositionerProps, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="-top-[calc(var(--item-block-padding)-1.8px)]! z-50 [--item-block-padding:6px] [--item-inline-padding:8px]"
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuPrimitive.Popup
          data-slot="dropdown-menu-sub-content"
          render={
            <div
              className={cn(
                "pointer-events-auto min-w-[max(8rem,calc(var(--anchor-width)-1rem))]! origin-(--transform-origin) rounded-[12px] border border-border bg-popover p-1 text-popover-foreground shadow-md data-ending-style:pointer-events-none",
                transitionPresets.snappyOut,
                animationPresets.scale,
                className
              )}
            >
              {children}
            </div>
          }
          {...props}
        />
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuBackdrop,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
};
