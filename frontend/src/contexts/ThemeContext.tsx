import React, { createContext, useContext, useEffect, useState } from "react";
import {
  applyCustomTheme,
  lightTheme,
  darkTheme,
  oceanTheme,
  forestTheme,
} from "../themes/themes";

type Theme = "light" | "dark" | "system" | "ocean" | "forest";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | "system" | "ocean" | "forest";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or use default
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      return stored || defaultTheme;
    }

    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme classes
    root.classList.remove("light", "dark", "ocean", "forest");

    let resolvedThemeValue: "light" | "dark" | "ocean" | "forest";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      resolvedThemeValue = systemTheme;
    } else {
      resolvedThemeValue = theme;
    }

    // Apply theme based on type using consistent applyCustomTheme function
    if (resolvedThemeValue === "ocean") {
      applyCustomTheme("ocean", oceanTheme);
    } else if (resolvedThemeValue === "forest") {
      applyCustomTheme("forest", forestTheme);
    } else if (resolvedThemeValue === "light") {
      applyCustomTheme("light", lightTheme);
    } else if (resolvedThemeValue === "dark") {
      applyCustomTheme("dark", darkTheme);
    }

    setResolvedTheme(resolvedThemeValue);

    // Save theme to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newResolvedTheme = mediaQuery.matches ? "dark" : "light";

      // Apply theme consistently using applyCustomTheme
      if (newResolvedTheme === "dark") {
        applyCustomTheme("dark", darkTheme);
      } else {
        applyCustomTheme("light", lightTheme);
      }

      setResolvedTheme(newResolvedTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { useTheme };
