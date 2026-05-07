"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default "light" — gets overridden by the no-flash script in layout.tsx
  // and by the localStorage hydration effect below.
  const [theme, setThemeState] = useState<Theme>("light");

  // On mount, read whatever the no-flash script set on <html>
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (current === "light" || current === "dark") {
      setThemeState(current);
    }
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cs-theme", next);
    } catch {
      // localStorage unavailable (private mode etc.) — non-fatal
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback so components don't crash if used outside provider
    return {
      theme: "light" as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
