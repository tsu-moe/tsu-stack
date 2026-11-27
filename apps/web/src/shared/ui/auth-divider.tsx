import type React from "react";

export function AuthDivider({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="relative flex w-full items-center" {...props}>
      <div className="w-full border-t" />
      <div className="flex w-max justify-center px-2 text-xs text-nowrap text-muted-foreground">{children}</div>
      <div className="w-full border-t" />
    </div>
  );
}
