import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      let stored: string | null = null;

      if (Platform.OS === 'web') {
        stored = globalThis.localStorage?.getItem(STORAGE_KEY);
      } else {
        stored = await SecureStore.getItemAsync(STORAGE_KEY);
      }

      if (stored) {
        setIsDarkMode(stored === 'dark');
      }
      setIsLoaded(true);
    }

    loadTheme();
  }, []);

  async function persistTheme(value: boolean) {
    const themeValue = value ? 'dark' : 'light';

    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(STORAGE_KEY, themeValue);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, themeValue);
    }
  }

  function toggleTheme(value: boolean) {
    setIsDarkMode(value);
    persistTheme(value);
  }

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
