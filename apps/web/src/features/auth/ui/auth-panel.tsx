import { type ReactNode } from "react";

export function AuthPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 motion-safe:animate-in motion-safe:duration-200 motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
      <h1 className="font-heading text-center text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
