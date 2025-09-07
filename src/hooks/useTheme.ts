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
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
  color: Colors;
  setColor: (color: Colors) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  appearance: THEME_DEFAULTS.appearance,
  setAppearance: () => {},
  color: THEME_DEFAULTS.color,
  setColor: () => {},
});

export const useTheme = () => {
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

  const [color, setColor] = useState<Colors>(() => {
    if (enableLocalStorage) {
      const storedColor = localStorage.getItem("color");
      const cleanedColor = storedColor
        ? storedColor.replace(/^"|"$/g, "")
        : null;
      if (allowedColors.includes(cleanedColor as Colors)) {
        return cleanedColor as Colors;
      }
    }

    return (defaultColor as Colors) || THEME_DEFAULTS.color;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (appearance === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(appearance);
    }
    if (enableLocalStorage) {
      localStorage.setItem("appearance", appearance);
    }
  }, [appearance, enableLocalStorage]);

  useEffect(() => {
    if (enableLocalStorage) {
      localStorage.setItem("color", color);
    }
  }, [color, enableLocalStorage]);

  return { appearance, setAppearance, color, setColor };
};
