'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleSheetManager, ServerStyleSheet, ThemeProvider } from 'styled-components';
import { darkTheme } from '@apisit110/pos-ui';

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') {
    return <ThemeProvider theme={darkTheme}>{children}</ThemeProvider>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      <ThemeProvider theme={darkTheme}>
        {children}
      </ThemeProvider>
    </StyleSheetManager>
  );
}
