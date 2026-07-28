import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { type ButtonProps } from "@tsu-stack/ui/components/button";
import { Button } from "@tsu-stack/ui/components/button";
export { ThemeProvider } from "next-themes";

function getThemeInitializerScript(storageKey = "theme", defaultTheme = "dark") {
  const key = JSON.stringify(storageKey);
  const fallback = JSON.stringify(defaultTheme);

  return `(function(){var t=${fallback};try{var s=localStorage.getItem(${key});if(s==='light'||s==='dark'||s==='system'){t=s}if(t==='system'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}}catch(e){}var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t})()`;
}

const themeInitializerScript = getThemeInitializerScript();

/** Applies the saved theme before stylesheets can paint the document. */
export function ThemeInitializer() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />;
}

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
      <Sun
        className="absolute scale-100 rotate-0 transition-all duration-50 dark:scale-0 dark:rotate-90"
        size={18}
        strokeWidth={2}
      />
      <Moon
        className="absolute scale-0 rotate-90 transition-all duration-50 dark:scale-100 dark:rotate-0"
        size={18}
        strokeWidth={2}
      />
    </Button>
  );
}
