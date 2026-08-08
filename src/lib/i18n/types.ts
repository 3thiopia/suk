export type Language = 'en' | 'am' | 'om' | 'ti';

export interface LanguageOption {
  code: Language;
  shortCode: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    shortCode: 'EN',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'am',
    shortCode: 'AM',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    flag: '🇪🇹',
  },
  {
    code: 'om',
    shortCode: 'OM',
    name: 'Afaan Oromoo',
    nativeName: 'Afaan Oromoo',
    flag: '🇪🇹',
  },
  {
    code: 'ti',
    shortCode: 'TI',
    name: 'Tigrinya',
    nativeName: 'ትግርኛ',
    flag: '🇪🇹',
  },
];

export type TranslationDictionary = Record<string, string>;
