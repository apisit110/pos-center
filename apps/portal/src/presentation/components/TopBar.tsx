'use client';

import React from 'react';
import { TopBar as SharedTopBar } from '@apisit110/pos-ui';
import { useAppTheme } from '../../lib/theme-context';

interface TopBarProps {
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { themeMode, toggleTheme } = useAppTheme();

  return (
    <SharedTopBar
      title={title}
      themeMode={themeMode}
      onThemeToggle={toggleTheme}
    />
  );
};
