import { type ReactNode } from "react";

export function AuthPanel({
  title,
  description,
  children
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 motion-safe:animate-in motion-safe:duration-200 motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-wide">{title}</h1>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
