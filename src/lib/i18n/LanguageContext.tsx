import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageOption, SUPPORTED_LANGUAGES, TranslationDictionary } from './types';
import { en } from './translations/en';
import { am } from './translations/am';
import { om } from './translations/om';
import { ti } from './translations/ti';
import { Globe, ChevronDown, Check } from 'lucide-react';

const translations: Record<Language, TranslationDictionary> = {
  en,
  am,
  om,
  ti,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  currentLanguageOption: LanguageOption;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'en' || saved === 'am' || saved === 'om' || saved === 'ti')) {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    if (en[key]) {
      return en[key];
    }
    // Fallback to defaultText or formatted key name
    return defaultText || key;
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageOption,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full' | 'dropdown' | 'inline';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage, supportedLanguages, currentLanguageOption } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'inline') {
    return (
      <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-100/80 border border-neutral-200/80 ${className}`}>
        {supportedLanguages.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200/70 border border-neutral-200/60'
              }`}
            >
              <span className={`px-1 py-0.2 text-[10px] font-black uppercase tracking-wider rounded ${
                isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
              }`}>
                {lang.shortCode}
              </span>
              <span className="truncate text-xs font-bold">{lang.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-neutral-200 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors shrink-0"
        title={`Language: ${currentLanguageOption.name}`}
        aria-label="Select Language"
      >
        <Globe className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
        <span className="font-extrabold text-xs text-neutral-900 tracking-wider uppercase">
          {currentLanguageOption.shortCode}
        </span>
        <ChevronDown className={`h-3 w-3 text-neutral-400 transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 z-50 w-52 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
              Select Language / ቋንቋ
            </div>
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'text-neutral-800 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                    }`}>
                      {lang.shortCode}
                    </span>
                    <div className="flex flex-col text-left truncate">
                      <span className="text-xs font-bold leading-tight truncate">{lang.name}</span>
                      {lang.nativeName !== lang.name && (
                        <span className={`text-[10px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {lang.nativeName}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0 ml-2 font-bold" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
