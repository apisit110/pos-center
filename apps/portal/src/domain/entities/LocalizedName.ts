export type NameLanguage = 'en' | 'th';

/** name in the given UI language, falling back to the other one when empty */
export const pickName = (language: NameLanguage, nameEn: string, nameTh: string): string =>
  language === 'en' ? nameEn || nameTh : nameTh || nameEn;
