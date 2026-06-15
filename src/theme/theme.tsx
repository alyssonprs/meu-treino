import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "dark" | "light";

const defaultTheme: ThemePreference = "dark";
const themeStorageKey = "meu-treino:theme";
const themeColorByPreference: Record<ThemePreference, string> = {
  dark: "#0F1115",
  light: "#F6F8FA",
};

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(getStoredTheme);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    );
  }, []);

  useEffect(() => {
    applyTheme(theme);
    storeTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedTheme = safeLocalStorageGet(themeStorageKey);

  return isThemePreference(storedTheme) ? storedTheme : defaultTheme;
}

function storeTheme(theme: ThemePreference) {
  safeLocalStorageSet(themeStorageKey, theme);
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColorByPreference[theme]);
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "dark" || value === "light";
}

function safeLocalStorageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}
