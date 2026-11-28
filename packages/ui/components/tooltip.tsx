"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { useMemo, type ComponentProps } from "react";

import { cn } from "@tsu-stack/ui/lib/utils";

type TooltipAnimationPreset = "none" | "scale" | "fade" | "slideOutside" | "slideInside" | "motion" | "motionBlur";

type TooltipTransitionPreset =
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

const animationPresets: Record<TooltipAnimationPreset, string> = {
  none: "transition-none",
  scale:
    "[transition-property:scale,opacity] data-starting-style:scale-80 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:scale-80",
  fade: "[transition-property:opacity,scale] data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:scale-98",
  slideOutside:
    "[transition-property:translate,opacity] data-[side=bottom]:data-starting-style:translate-y-[10px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:translate-y-[10px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=top]:data-starting-style:translate-y-[-10px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-ending-style:translate-y-[-10px] data-[side=top]:data-ending-style:opacity-0 data-[side=left]:data-starting-style:translate-x-[-10px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-ending-style:translate-x-[-10px] data-[side=left]:data-ending-style:opacity-0 data-[side=right]:data-starting-style:translate-x-[10px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-ending-style:translate-x-[10px] data-[side=right]:data-ending-style:opacity-0 data-[side=inline-start]:data-starting-style:translate-x-[-10px] data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-ending-style:translate-x-[-10px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-end]:data-starting-style:translate-x-[10px] data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-ending-style:translate-x-[10px] data-[side=inline-end]:data-ending-style:opacity-0",
  slideInside:
    "[transition-property:translate,opacity] data-[side=bottom]:data-starting-style:translate-y-[-10px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:translate-y-[-10px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=top]:data-starting-style:translate-y-[10px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-ending-style:translate-y-[10px] data-[side=top]:data-ending-style:opacity-0 data-[side=left]:data-starting-style:translate-x-[10px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-ending-style:translate-x-[10px] data-[side=left]:data-ending-style:opacity-0 data-[side=right]:data-starting-style:translate-x-[-10px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-ending-style:translate-x-[-10px] data-[side=right]:data-ending-style:opacity-0 data-[side=inline-start]:data-starting-style:translate-x-[10px] data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-ending-style:translate-x-[10px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-end]:data-starting-style:translate-x-[-10px] data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-ending-style:translate-x-[-10px] data-[side=inline-end]:data-ending-style:opacity-0",
  motion:
    "[transition-property:translate,scale,opacity,rotateX,rotateY,transform] [will-change:translate,scale,opacity,rotateX,rotateY,transform] motion-reduce:transition-none motion-reduce:transform-none [transform:perspective(1000px)] data-[side=bottom]:data-starting-style:translate-y-[7px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:scale-[0.26] data-[side=bottom]:data-starting-style:rotate-x-[70deg] data-[side=bottom]:data-ending-style:translate-y-[7px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=bottom]:data-ending-style:scale-[0.26] data-[side=bottom]:data-ending-style:rotate-x-[70deg] data-[side=top]:data-starting-style:translate-y-[7px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-starting-style:scale-[0.26] data-[side=top]:data-starting-style:rotate-x-[70deg] data-[side=top]:data-ending-style:translate-y-[7px] data-[side=top]:data-ending-style:opacity-0 data-[side=top]:data-ending-style:scale-[0.26] data-[side=top]:data-ending-style:rotate-x-[70deg] data-[side=left]:data-starting-style:translate-x-[-7px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-starting-style:scale-[0.26] data-[side=left]:data-starting-style:rotate-y-[-40deg] data-[side=left]:data-ending-style:translate-x-[-7px] data-[side=left]:data-ending-style:opacity-0 data-[side=left]:data-ending-style:scale-[0.26] data-[side=left]:data-ending-style:rotate-y-[-40deg] data-[side=right]:data-starting-style:translate-x-[7px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-starting-style:scale-[0.26] data-[side=right]:data-starting-style:rotate-y-[40deg] data-[side=right]:data-ending-style:translate-x-[7px] data-[side=right]:data-ending-style:opacity-0 data-[side=right]:data-ending-style:scale-[0.26] data-[side=right]:data-ending-style:rotate-y-[40deg] data-[side=inline-start]:data-starting-style:translate-x-[-7px] data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-starting-style:scale-[0.26] data-[side=inline-start]:data-starting-style:rotate-y-[-40deg] data-[side=inline-start]:data-ending-style:translate-x-[-7px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-start]:data-ending-style:scale-[0.26] data-[side=inline-start]:data-ending-style:rotate-y-[-40deg] data-[side=inline-end]:data-starting-style:translate-x-[7px] data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-starting-style:scale-[0.26] data-[side=inline-end]:data-starting-style:rotate-y-[40deg] data-[side=inline-end]:data-ending-style:translate-x-[7px] data-[side=inline-end]:data-ending-style:opacity-0 data-[side=inline-end]:data-ending-style:scale-[0.26] data-[side=inline-end]:data-ending-style:rotate-y-[40deg]",
  motionBlur:
    "[transition-property:translate,scale,opacity,rotateX,rotateY,transform,filter] [will-change:translate,scale,opacity,rotateX,rotateY,transform,filter] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:filter-none [transform:perspective(1000px)] data-starting-style:blur-[9px] data-ending-style:blur-[9px] data-[side=bottom]:data-starting-style:translate-y-[7px] data-[side=bottom]:data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:scale-[0.26] data-[side=bottom]:data-starting-style:rotate-x-[70deg] data-[side=bottom]:data-ending-style:translate-y-[7px] data-[side=bottom]:data-ending-style:opacity-0 data-[side=bottom]:data-ending-style:scale-[0.26] data-[side=bottom]:data-ending-style:rotate-x-[70deg] data-[side=top]:data-starting-style:translate-y-[7px] data-[side=top]:data-starting-style:opacity-0 data-[side=top]:data-starting-style:scale-[0.26] data-[side=top]:data-starting-style:rotate-x-[70deg] data-[side=top]:data-ending-style:translate-y-[7px] data-[side=top]:data-ending-style:opacity-0 data-[side=top]:data-ending-style:scale-[0.26] data-[side=top]:data-ending-style:rotate-x-[70deg] data-[side=left]:data-starting-style:translate-x-[-7px] data-[side=left]:data-starting-style:opacity-0 data-[side=left]:data-starting-style:scale-[0.26] data-[side=left]:data-starting-style:rotate-y-[-40deg] data-[side=left]:data-ending-style:translate-x-[-7px] data-[side=left]:data-ending-style:opacity-0 data-[side=left]:data-ending-style:scale-[0.26] data-[side=left]:data-ending-style:rotate-y-[-40deg] data-[side=right]:data-starting-style:translate-x-[7px] data-[side=right]:data-starting-style:opacity-0 data-[side=right]:data-starting-style:scale-[0.26] data-[side=right]:data-starting-style:rotate-y-[40deg] data-[side=right]:data-ending-style:translate-x-[7px] data-[side=right]:data-ending-style:opacity-0 data-[side=right]:data-ending-style:scale-[0.26] data-[side=right]:data-ending-style:rotate-y-[40deg] data-[side=inline-start]:data-starting-style:translate-x-[-7px] data-[side=inline-start]:data-starting-style:opacity-0 data-[side=inline-start]:data-starting-style:scale-[0.26] data-[side=inline-start]:data-starting-style:rotate-y-[-40deg] data-[side=inline-start]:data-ending-style:translate-x-[-7px] data-[side=inline-start]:data-ending-style:opacity-0 data-[side=inline-start]:data-ending-style:scale-[0.26] data-[side=inline-start]:data-ending-style:rotate-y-[-40deg] data-[side=inline-end]:data-starting-style:translate-x-[7px] data-[side=inline-end]:data-starting-style:opacity-0 data-[side=inline-end]:data-starting-style:scale-[0.26] data-[side=inline-end]:data-starting-style:rotate-y-[40deg] data-[side=inline-end]:data-ending-style:translate-x-[7px] data-[side=inline-end]:data-ending-style:opacity-0 data-[side=inline-end]:data-ending-style:scale-[0.26] data-[side=inline-end]:data-ending-style:rotate-y-[40deg]"
};

const motionReduceClasses =
  "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:[translate:none] motion-reduce:[scale:1] motion-reduce:[rotate:none] motion-reduce:filter-none";

const transitionPresets: Record<TooltipTransitionPreset, string> = {
  inExpo: "duration-[0.25s] ease-[cubic-bezier(0.95,0.05,0.795,0.035)]",
  outExpo: "duration-[0.25s] ease-[cubic-bezier(0.19,1,0.22,1)]",
  inOutExpo: "duration-[0.25s] ease-[cubic-bezier(1,0,0,1)]",
  anticipate: "duration-[0.25s] ease-[cubic-bezier(1,-0.4,0.35,0.95)]",
  quickOut: "duration-[0.25s] ease-out",
  overshootOut: "duration-[0.25s] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
  swiftOut: "duration-[0.25s] ease-[cubic-bezier(0.175,0.885,0.32,1.1)]",
  snappyOut: "duration-[0.25s] ease-[cubic-bezier(0.19,1,0.22,1)]",
  in: "duration-[0.25s] ease-[cubic-bezier(0.42,0,1,1)]",
  out: "duration-[0.25s] ease-[cubic-bezier(0,0,0.58,1)]",
  inOut: "duration-[0.25s] ease-[cubic-bezier(0.42,0,0.58,1)]",
  outIn: "duration-[0.25s] ease-[cubic-bezier(0.1,0.7,0.9,0.5)]",
  inQuad: "duration-[0.25s] ease-[cubic-bezier(0.55,0.085,0.68,0.53)]",
  outQuad: "duration-[0.25s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
  inOutQuad: "duration-[0.32s] ease-[cubic-bezier(0.455,0.03,0.515,0.955)]",
  inCubic: "duration-[0.25s] ease-[cubic-bezier(0.55,0.055,0.675,0.19)]",
  outCubic: "duration-[0.25s] ease-[cubic-bezier(0.215,0.61,0.355,1)]",
  inOutCubic: "duration-[0.25s] ease-[cubic-bezier(0.645,0.045,0.355,1)]",
  inQuart: "duration-[0.25s] ease-[cubic-bezier(0.895,0.03,0.685,0.22)]",
  outQuart: "duration-[0.25s] ease-[cubic-bezier(0.165,0.84,0.44,1)]",
  inOutQuart: "duration-[0.25s] ease-[cubic-bezier(0.77,0,0.175,1)]",
  inQuint: "duration-[0.25s] ease-[cubic-bezier(0.755,0.05,0.855,0.06)]",
  outQuint: "duration-[0.25s] ease-[cubic-bezier(0.23,1,0.32,1)]",
  inOutQuint: "duration-[0.25s] ease-[cubic-bezier(0.86,0,0.07,1)]",
  inCirc: "duration-[0.25s] ease-[cubic-bezier(0.6,0.04,0.98,0.335)]",
  outCirc: "duration-[0.25s] ease-[cubic-bezier(0.075,0.82,0.165,1)]",
  inOutCirc: "duration-[0.25s] ease-[cubic-bezier(0.785,0.135,0.15,0.86)]",
  inOutBase: "duration-[0.25s] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
  none: "duration-0 ease-none"
};

const tooltipSurfaceStyles =
  "[--radius:10px] [--overlay-border:color-mix(in_oklab,var(--border)_96%,var(--popover-foreground)_4%)] rounded-(--radius) border [border-color:var(--overlay-border)] bg-popover text-[13px] text-balance shadow-xs dark:[--overlay-border:color-mix(in_oklab,var(--border)_94%,var(--popover-foreground)_6%)]";

function TooltipSurface({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(tooltipSurfaceStyles, "px-2 py-1", className)} data-slot="tooltip-surface" {...props} />;
}

function TooltipProvider({ delay = 300, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

const Tooltip = Object.assign(
  function Tooltip<Payload>(props: TooltipPrimitive.Root.Props<Payload>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  },
  { createHandle: TooltipPrimitive.createHandle }
);

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipPortal(props: TooltipPrimitive.Portal.Props) {
  return <TooltipPrimitive.Portal data-slot="tooltip-portal" {...props} />;
}

function TooltipPositioner({ className, side = "top", ...props }: TooltipPrimitive.Positioner.Props) {
  return (
    <TooltipPortal>
      <TooltipPrimitive.Positioner
        className={cn(
          "z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none",
          (side === "inline-end" || side === "inline-start") && "**:data-[slot=tooltip-arrow]:hidden",
          className
        )}
        data-slot="tooltip-positioner"
        side={side}
        {...props}
      />
    </TooltipPortal>
  );
}

function TooltipPopup({
  className,
  animationPreset = "scale",
  transitionPreset = "outQuint",
  reduceMotion = false,
  showArrow = false,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset" | "align" | "alignOffset"> & {
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
  const groupTransition =
    reduceMotion || animationPreset === "none"
      ? ""
      : "transition-[width,height,opacity,transform,scale,translate,filter] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <TooltipPositioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        className={cn(
          tooltipSurfaceStyles,
          "pointer-events-auto relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-[500px] origin-(--transform-origin) data-instant:transition-none",
          animation,
          transition,
          groupTransition,
          className
        )}
        data-slot="tooltip-popup"
        {...props}
      >
        {showArrow ? (
          <TooltipPrimitive.Arrow
            className="relative block h-1.5 w-3 overflow-clip transition-[left] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:[transform:translate(-50%,50%)_rotate(45deg)] before:border before:[border-color:var(--overlay-border)] before:bg-popover before:content-[''] data-instant:transition-none data-[side=bottom]:top-[-6px] data-[side=inline-end]:left-[-9px] data-[side=inline-end]:-rotate-90 data-[side=inline-start]:right-[-9px] data-[side=inline-start]:rotate-90 data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180"
            data-slot="tooltip-arrow"
          />
        ) : null}
        <TooltipPrimitive.Viewport
          className="relative h-full w-full overflow-clip px-[var(--viewport-inline-padding)] py-1 [--viewport-inline-padding:0.5rem] [&_[data-current]]:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding))] [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100 [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms] [&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2 data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2 data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0 [&_[data-previous]]:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding))] [&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100 [&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-[350ms,175ms] [&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2 data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2 data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0 [[data-instant]_&_[data-current]]:transition-none [[data-instant]_&_[data-previous]]:transition-none"
          data-slot="tooltip-viewport"
        >
          {children}
        </TooltipPrimitive.Viewport>
      </TooltipPrimitive.Popup>
    </TooltipPositioner>
  );
}

const TooltipContent = TooltipPopup;

export {
  Tooltip,
  TooltipContent,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipSurface,
  TooltipTrigger
};
