import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

type ThemeContextType = {
  isDarkMode: boolean;
  isThemeReady: boolean;
  toggleTheme: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        let stored: string | null = null;

        if (Platform.OS === 'web') {
          stored = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
        } else {
          stored = await SecureStore.getItemAsync(STORAGE_KEY);
        }

        if (stored) {
          setIsDarkMode(stored === 'dark');
        }
      } finally {
        setIsThemeReady(true);
      }
    })();
  }, []);

  const persistTheme = useCallback(async (value: boolean) => {
    const themeValue = value ? 'dark' : 'light';

    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(STORAGE_KEY, themeValue);
      return;
    }

    await SecureStore.setItemAsync(STORAGE_KEY, themeValue);
  }, []);

  const toggleTheme = useCallback(
    (value: boolean) => {
      setIsDarkMode(value);
      void persistTheme(value);
    },
    [persistTheme],
  );

  const contextValue = useMemo(
    () => ({
      isDarkMode,
      isThemeReady,
      toggleTheme,
    }),
    [isDarkMode, isThemeReady, toggleTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
