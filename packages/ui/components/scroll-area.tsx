import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@tsu-stack/ui/lib/utils";

type ScrollAreaProps = {
  cornerStyle?: React.CSSProperties;
  fadeColor?: string;
  hideScrollbar?: boolean;
  horizontalScrollbarStyle?: React.CSSProperties;
  orientation?: "horizontal" | "vertical" | "both";
  scrollbarClassName?: string;
  scrollShadow?: "vertical" | "horizontal" | "both" | "none";
  verticalScrollbarStyle?: React.CSSProperties;
  viewportClassName?: string;
  viewportTabIndex?: number;
} & ScrollAreaPrimitive.Root.Props;

type ScrollAreaStyle = React.CSSProperties & Record<`--${string}`, string>;

function ScrollArea({
  className,
  cornerStyle,
  fadeColor,
  horizontalScrollbarStyle,
  viewportClassName,
  viewportTabIndex,
  hideScrollbar = false,
  orientation = "vertical",
  scrollbarClassName,
  scrollShadow = "none",
  verticalScrollbarStyle,
  children,
  ...props
}: ScrollAreaProps) {
  const fadeColorStyle: ScrollAreaStyle = fadeColor === undefined ? {} : { "--scroll-area-fade": fadeColor };

  return (
    <ScrollAreaPrimitive.Root className={cn("relative isolate flex min-h-0 flex-col", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-fade-mode={fadeColor === undefined ? "auto" : "custom"}
        data-scroll-shadow={scrollShadow}
        data-slot="scroll-area-viewport"
        tabIndex={viewportTabIndex}
        className={cn(
          "size-full min-h-0 flex-1 overscroll-contain rounded-[inherit] transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          orientation === "vertical" && "[overflow-x:hidden!important] overflow-x-hidden!",
          orientation === "horizontal" && "[overflow-y:hidden!important] overflow-y-hidden!",
          viewportClassName
        )}
        style={{
          ...(orientation === "vertical" ? { overflowX: "hidden" } : {}),
          ...(orientation === "horizontal" ? { overflowY: "hidden" } : {})
        }}
      >
        <div
          data-slot="scroll-area-vertical-shadow"
          className={cn(scrollShadow === "vertical" || scrollShadow === "both" ? "block" : "hidden", [
            "pointer-events-none absolute inset-0 z-10",
            "before:absolute before:top-0 before:block before:w-full before:rounded-md before:rounded-b-none before:content-[''] after:absolute after:bottom-0 after:block after:w-full after:rounded-md after:rounded-t-none after:content-['']",
            "before:pointer-events-none after:pointer-events-none",
            "before:transition-[height] before:duration-100 before:ease-out after:transition-[height] after:duration-100 after:ease-out",
            "before:[--scroll-area-overflow-y-start:inherit]",
            "after:[--scroll-area-overflow-y-end:inherit]",
            "[--scroll-area-fade:var(--background)] before:h-[min(var(--scroll-area-fade-size,40px),var(--scroll-area-overflow-y-start))] before:bg-[linear-gradient(to_bottom,var(--scroll-area-fade),transparent)] after:h-[min(var(--scroll-area-fade-size,40px),var(--scroll-area-overflow-y-end,40px))] after:bg-[linear-gradient(to_top,var(--scroll-area-fade),transparent)]"
          ])}
          style={
            {
              "--scroll-area-overflow-y-start": "inherit",
              "--scroll-area-overflow-y-end": "inherit",
              ...fadeColorStyle
            } as ScrollAreaStyle
          }
        />
        <div
          data-slot="scroll-area-horizontal-shadow"
          className={cn(scrollShadow === "horizontal" || scrollShadow === "both" ? "block" : "hidden", [
            "pointer-events-none absolute inset-0 z-10",
            "before:absolute before:top-0 before:block before:h-full before:rounded-md before:rounded-r-none before:content-[''] after:absolute after:top-0 after:block after:h-full after:rounded-md after:rounded-l-none after:content-['']",
            "before:pointer-events-none after:pointer-events-none",
            "before:transition-[width] before:duration-100 before:ease-out after:transition-[width] after:duration-100 after:ease-out",
            "before:[--scroll-area-overflow-x-start:inherit]",
            "after:[--scroll-area-overflow-x-end:inherit]",
            "[--scroll-area-fade:var(--background)] before:left-0 before:w-[min(var(--scroll-area-fade-size,40px),var(--scroll-area-overflow-x-start))] before:bg-[linear-gradient(to_right,var(--scroll-area-fade),transparent)] after:right-0 after:w-[min(var(--scroll-area-fade-size,40px),var(--scroll-area-overflow-x-end,40px))] after:bg-[linear-gradient(to_left,var(--scroll-area-fade),transparent)]"
          ])}
          style={
            {
              "--scroll-area-overflow-x-start": "inherit",
              "--scroll-area-overflow-x-end": "inherit",
              ...fadeColorStyle
            } as ScrollAreaStyle
          }
        />
        {children}
      </ScrollAreaPrimitive.Viewport>
      {!hideScrollbar &&
        (orientation === "both" ? (
          <>
            <ScrollBar orientation="vertical" className={scrollbarClassName} style={verticalScrollbarStyle} />
            <ScrollBar orientation="horizontal" className={scrollbarClassName} style={horizontalScrollbarStyle} />
          </>
        ) : (
          <ScrollBar
            orientation={orientation}
            className={scrollbarClassName}
            style={orientation === "vertical" ? verticalScrollbarStyle : horizontalScrollbarStyle}
          />
        ))}
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" style={cornerStyle} />
      <style>{`
[data-slot="scroll-area-viewport"][data-fade-mode="auto"][data-scroll-shadow="vertical"],
[data-slot="scroll-area-viewport"][data-fade-mode="auto"][data-scroll-shadow="both"] {
  --scroll-area-fade-y-start: min(var(--scroll-area-overflow-y-start, 0px), var(--scroll-area-fade-size, 40px));
  --scroll-area-fade-y-end: min(var(--scroll-area-overflow-y-end, 0px), var(--scroll-area-fade-size, 40px));
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black var(--scroll-area-fade-y-start),
    black calc(100% - var(--scroll-area-fade-y-end)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black var(--scroll-area-fade-y-start),
    black calc(100% - var(--scroll-area-fade-y-end)),
    transparent 100%
  );
}
[data-slot="scroll-area-viewport"][data-fade-mode="auto"][data-scroll-shadow="horizontal"],
[data-slot="scroll-area-viewport"][data-fade-mode="auto"][data-scroll-shadow="both"] {
  --scroll-area-fade-x-start: min(var(--scroll-area-overflow-x-start, 0px), var(--scroll-area-fade-size, 40px));
  --scroll-area-fade-x-end: min(var(--scroll-area-overflow-x-end, 0px), var(--scroll-area-fade-size, 40px));
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black var(--scroll-area-fade-x-start),
    black calc(100% - var(--scroll-area-fade-x-end)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black var(--scroll-area-fade-x-start),
    black calc(100% - var(--scroll-area-fade-x-end)),
    transparent 100%
  );
}
[data-slot="scroll-area-viewport"][data-fade-mode="auto"][data-scroll-shadow="both"] {
  -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black var(--scroll-area-fade-y-start),
      black calc(100% - var(--scroll-area-fade-y-end)),
      transparent 100%
    ),
    linear-gradient(
      to right,
      transparent 0,
      black var(--scroll-area-fade-x-start),
      black calc(100% - var(--scroll-area-fade-x-end)),
      transparent 100%
    );
  mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black var(--scroll-area-fade-y-start),
      black calc(100% - var(--scroll-area-fade-y-end)),
      transparent 100%
    ),
    linear-gradient(
      to right,
      transparent 0,
      black var(--scroll-area-fade-x-start),
      black calc(100% - var(--scroll-area-fade-x-end)),
      transparent 100%
    );
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
[data-slot="scroll-area-viewport"][data-fade-mode="auto"] [data-slot="scroll-area-vertical-shadow"],
[data-slot="scroll-area-viewport"][data-fade-mode="auto"] [data-slot="scroll-area-horizontal-shadow"] {
  display: none;
}
`}</style>
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollAreaContent({ className, children, ...props }: ScrollAreaPrimitive.Content.Props) {
  return (
    <ScrollAreaPrimitive.Content data-slot="scroll-area-content" className={cn("w-full", className)} {...props}>
      {children}
    </ScrollAreaPrimitive.Content>
  );
}

function ScrollBar({ className, orientation = "vertical", ...props }: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        "relative z-20 m-1.5 flex rounded-full bg-muted opacity-0 transition-opacity delay-200 data-hovering:opacity-100 data-hovering:delay-0 data-hovering:duration-100 data-scrolling:opacity-100 data-scrolling:delay-0 data-scrolling:duration-100 data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-1.5",
        className
      )}
      data-base-ui-swipe-ignore
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className="relative flex-1 rounded-full bg-muted-foreground/40"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollAreaContent, ScrollBar };
