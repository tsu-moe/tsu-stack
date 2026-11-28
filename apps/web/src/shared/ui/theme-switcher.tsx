import { useHotkey } from "@tanstack/react-hotkeys";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type ComponentProps } from "react";
import { flushSync } from "react-dom";

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

type ThemeSwitcherProps = Pick<
  ComponentProps<typeof Button>,
  "className" | "disabled" | "radius" | "ref" | "size" | "variant"
>;

export function ThemeSwitcher({ variant = "ghost", size = "icon", disabled, ...props }: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => {
    const root = document.documentElement;
    root.setAttribute("data-theme-switching", "");
    try {
      flushSync(() => setTheme(resolvedTheme === "light" ? "dark" : "light"));
      // Commit the new styles while motion is suppressed so restoring it cannot start a transition.
      void root.offsetWidth;
    } finally {
      root.removeAttribute("data-theme-switching");
    }
  };
  const shortcut = "D";
  const label = m.ui__toggle_theme();

  useHotkey(shortcut, toggleTheme, {
    enabled: !disabled,
    ignoreInputs: true,
    requireReset: true,
    meta: { name: label }
  });

  return (
    <Button
      {...props}
      type="button"
      disabled={disabled}
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      title={`${label} (${shortcut})`}
    >
      <Sun aria-hidden="true" className="absolute scale-100 dark:scale-0" size={18} strokeWidth={2} />
      <Moon aria-hidden="true" className="absolute scale-0 dark:scale-100" size={18} strokeWidth={2} />
    </Button>
  );
}
