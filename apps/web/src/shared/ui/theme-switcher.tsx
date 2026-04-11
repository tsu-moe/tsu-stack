import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

import { type ButtonProps } from "@tsu-stack/ui/components/button";
import { Button } from "@tsu-stack/ui/components/button";
export { ThemeProvider } from "next-themes";

type ThemeSwitcherProps = {
  className?: string;
} & ButtonProps;

export function ThemeSwitcher({ variant = "ghost", size = "icon", className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const changeThemeValue =
    theme === "dark"
      ? "light"
      : theme === "light"
        ? "dark"
        : typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "light"
          : "dark";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setTheme(changeThemeValue)}
      aria-label="Toggle theme"
      className={className}
    >
      <IconSun
        className="absolute scale-100 rotate-0 transition-all duration-50 dark:scale-0 dark:rotate-90"
        size={18}
        strokeWidth={2}
      />
      <IconMoon
        className="absolute scale-0 rotate-90 transition-all duration-50 dark:scale-100 dark:rotate-0"
        size={18}
        strokeWidth={2}
      />
    </Button>
  );
}
