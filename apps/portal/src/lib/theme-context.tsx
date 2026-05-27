'use client';

import { createContext, useContext } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'dark',
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);
