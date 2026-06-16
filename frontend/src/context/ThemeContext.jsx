import { createContext, useState, useEffect, useCallback, useMemo } from "react";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("saku_theme") || "light";
  });

  const [cardStyle, setCardStyleState] = useState(() => {
    const saved = localStorage.getItem("saku_card_style");
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [showBalance, setShowBalanceState] = useState(() => {
    const saved = localStorage.getItem("saku_show_balance");
    return saved !== null ? saved === "true" : true;
  });

  // Resolve "system" to actual theme
  const [systemPref, setSystemPref] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemPref(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = useMemo(() => {
    return theme === "system" ? systemPref : theme;
  }, [theme, systemPref]);

  // Apply dark class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("saku_theme", newTheme);
  }, []);

  const setCardStyle = useCallback((index) => {
    setCardStyleState(index);
    localStorage.setItem("saku_card_style", String(index));
  }, []);

  const setShowBalance = useCallback((value) => {
    setShowBalanceState(value);
    localStorage.setItem("saku_show_balance", String(value));
  }, []);

  const toggleShowBalance = useCallback(() => {
    setShowBalanceState((prev) => {
      const next = !prev;
      localStorage.setItem("saku_show_balance", String(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    cardStyle,
    setTheme,
    setCardStyle,
    showBalance,
    setShowBalance,
    toggleShowBalance,
  }), [theme, resolvedTheme, cardStyle, setTheme, setCardStyle, showBalance, setShowBalance, toggleShowBalance]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
