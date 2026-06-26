import { useCallback, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "amangninou.theme";
const LIGHT_THEME_COLOR = "#1d6a35";
const DARK_THEME_COLOR = "#0d120f";

const isBrowser = () => typeof window !== "undefined";

const getPreferredTheme = () => {
  if (!isBrowser()) {
    return "light";
  }

  let savedTheme = null;

  try {
    savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    savedTheme = null;
  }

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  const colorPreference = window.matchMedia?.("(prefers-color-scheme: dark)");
  return colorPreference?.matches ? "dark" : "light";
};

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState(getPreferredTheme);
  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // Le theme reste actif pour la session si le stockage local est bloque.
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
      themeColor.setAttribute("content", isDarkMode ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }
  }, [isDarkMode, themeMode]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  return {
    isDarkMode,
    themeMode,
    toggleThemeMode,
  };
}
