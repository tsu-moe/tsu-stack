import { cn } from "@tsu-stack/ui/lib/utils";

export function CenteredLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("grid min-h-dvh place-items-center px-4 py-8", className)}>{children}</main>;
}
