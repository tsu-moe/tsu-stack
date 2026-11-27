import { useHotkey } from "@tanstack/react-hotkeys";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type ComponentProps } from "react";

import { m } from "@tsu-stack/i18n/messages";
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
} & ComponentProps<typeof Button>;

export function ThemeSwitcher({ variant = "ghost", size = "icon", className }: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === "light" ? "dark" : "light");
  const shortcut = "D";
  const label = m.ui__toggle_theme();

  useHotkey(shortcut, toggleTheme, { ignoreInputs: true, requireReset: true, meta: { name: label } });

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      title={`${label} (${shortcut})`}
      className={className}
    >
      <Sun
        aria-hidden="true"
        className="absolute scale-100 rotate-0 transition-all duration-50 dark:scale-0 dark:rotate-90"
        size={18}
        strokeWidth={2}
      />
      <Moon
        aria-hidden="true"
        className="absolute scale-0 rotate-90 transition-all duration-50 dark:scale-100 dark:rotate-0"
        size={18}
        strokeWidth={2}
      />
    </Button>
  );
}
