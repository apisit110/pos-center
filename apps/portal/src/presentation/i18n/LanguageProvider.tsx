'use client';

import React, { useEffect, useState } from 'react';
import { LanguageContext } from './LanguageContext';
import type { Language } from './LanguageContext';
import { en, th } from './translations';

const LANGUAGE_STORAGE_KEY = 'lightning_pos_language';

const dictionaries = { en, th };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('th');

  // Read after mount so the first client render matches the server-rendered HTML.
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'th' || stored === 'en') setLanguageState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: dictionaries[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};
