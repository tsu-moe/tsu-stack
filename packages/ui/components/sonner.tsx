import { AlertOctagon, AlertTriangle, CheckCircle, Info, Loader } from "lucide-react";
import { useTheme } from "next-themes";
import { type ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        error: <AlertOctagon className="size-4" />,
        info: <Info className="size-4" />,
        loading: <Loader className="size-4 animate-spin" />,
        success: <CheckCircle className="size-4" />,
        warning: <AlertTriangle className="size-4" />,
      }}
      style={
        {
          "--border-radius": "var(--radius)",
          "--normal-bg": "var(--popover)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
