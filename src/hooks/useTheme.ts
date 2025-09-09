import { useState, useEffect, createContext } from "react";
import { useConfigItem } from "@/config";

export const allowedColors = [
  "gray",
  "gold",
  "bronze",
  "brown",
  "yellow",
  "amber",
  "orange",
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "lime",
  "mint",
  "sky",
] as const;

export type Colors = (typeof allowedColors)[number];

export const allowedAppearances = ["light", "dark", "system"] as const;
export type Appearance = (typeof allowedAppearances)[number];

export const THEME_DEFAULTS = {
  appearance: "system" as Appearance,
  color: "gray" as Colors,
} as const;

export interface ThemeContextType {
  appearance: "light" | "dark";
  rawAppearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
  color: Colors;
  setColor: (color: Colors) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  appearance: "light",
  rawAppearance: THEME_DEFAULTS.appearance,
  setAppearance: () => {},
  color: THEME_DEFAULTS.color,
  setColor: () => {},
});

/**
 * Custom hook to convert "system" appearance to actual "light" or "dark" for Radix UI
 * @param appearance - The appearance setting from context ("light", "dark", or "system")
 * @returns The resolved appearance for Radix UI ("light" or "dark")
 */
export const useSystemTheme = (appearance: Appearance): "light" | "dark" => {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    // Initial system theme detection
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Add listener for system theme changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Return the resolved theme
  if (appearance === "system") {
    return systemTheme;
  }

  return appearance as "light" | "dark";
};

import { useContext } from "react";

export const useThemeManager = () => {
  const enableLocalStorage = useConfigItem("enableLocalStorage");
  const defaultAppearance = useConfigItem("selectedDefaultAppearance");
  const defaultColor = useConfigItem("selectThemeColor");

  const [appearance, setAppearance] = useState<Appearance>(() => {
    if (enableLocalStorage) {
      const storedAppearance = localStorage.getItem("appearance");
      const cleanedAppearance = storedAppearance
        ? storedAppearance.replace(/^"|"$/g, "")
        : null;
      if (allowedAppearances.includes(cleanedAppearance as Appearance)) {
        return cleanedAppearance as Appearance;
      }
    }
    return (defaultAppearance as Appearance) || THEME_DEFAULTS.appearance;
  });

  const [color, setColor] = useState<Colors>(
    (defaultColor as Colors) || THEME_DEFAULTS.color
  );

  useEffect(() => {
    setColor((defaultColor as Colors) || THEME_DEFAULTS.color);
  }, [defaultColor]);

  const resolvedAppearance = useSystemTheme(appearance);

  useEffect(() => {
    if (enableLocalStorage) {
      localStorage.setItem("appearance", appearance);
    }
  }, [appearance, enableLocalStorage]);

  return {
    appearance: resolvedAppearance,
    rawAppearance: appearance,
    setAppearance,
    color,
    setColor,
  };
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
