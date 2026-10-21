'use client';

import { createContext, useContext } from 'react';
import { th } from './translations';
import type { Translations } from './translations';

export type Language = 'en' | 'th';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'th',
  setLanguage: () => {},
  t: th,
});

export const useTranslation = () => useContext(LanguageContext);
