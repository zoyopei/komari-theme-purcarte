import { useState, useEffect } from "react";
import { useConfigItem } from "@/config/hooks";

type Theme = "light" | "dark" | "system";

export const useTheme = () => {
  const defaultAppearance = useConfigItem("selectedDefaultAppearance");

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("appearance");
    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      return storedTheme;
    }
    return (defaultAppearance as Theme) || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("appearance", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return { theme, toggleTheme };
};
