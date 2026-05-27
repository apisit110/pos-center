'use client';

import React, { useState, useEffect } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleSheetManager, ServerStyleSheet, ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from '@apisit110/pos-ui';
import { ThemeContext } from './theme-context';

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  const styledTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  if (typeof window !== 'undefined') {
    return (
      <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
        <ThemeProvider theme={styledTheme}>{children}</ThemeProvider>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
        <ThemeProvider theme={styledTheme}>{children}</ThemeProvider>
      </StyleSheetManager>
    </ThemeContext.Provider>
  );
}
