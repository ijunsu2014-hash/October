import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { FluentProvider } from "@fluentui/react-components";
import { simsimplayThemes } from "../theme";

export type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode(mode: ThemeMode): void;
}

const storageKey = "simsimplay.theme-mode";
const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    window.localStorage.getItem(storageKey) === "dark" ? "dark" : "light",
  );

  useLayoutEffect(() => {
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  function setMode(nextMode: ThemeMode) {
    window.localStorage.setItem(storageKey, nextMode);
    setModeState(nextMode);
  }

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <FluentProvider
        theme={simsimplayThemes[mode]}
        style={{
          minHeight: "100vh",
          colorScheme: mode,
          backgroundColor: "var(--colorNeutralBackground1)",
          color: "var(--colorNeutralForeground1)",
        }}
      >
        {children}
      </FluentProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return context;
}