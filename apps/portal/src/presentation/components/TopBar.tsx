'use client';

import React from 'react';
import { TopBar as SharedTopBar } from '@apisit110/pos-ui';
import { useAppTheme } from '../../lib/theme-context';
import { useTranslation } from '../i18n/LanguageContext';

interface TopBarProps {
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { themeMode, toggleTheme } = useAppTheme();
  const { language, setLanguage } = useTranslation();

  return (
    <SharedTopBar
      title={title}
      themeMode={themeMode}
      onThemeToggle={toggleTheme}
      language={language}
      onLanguageToggle={() => setLanguage(language === 'th' ? 'en' : 'th')}
    />
  );
};
