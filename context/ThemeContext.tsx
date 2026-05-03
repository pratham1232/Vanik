import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark";
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const KEY = "vanik_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((val) => {
      if (val === "light" || val === "dark" || val === "system") {
        setModeState(val);
      }
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  const theme: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
