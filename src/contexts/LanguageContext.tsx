import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations } from '@/lib/translations';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'ar' ? 'en' : 'ar'));
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const langTranslations = translations[language];
    let text = key.split('.').reduce((obj: any, k) => obj?.[k], langTranslations);

    if (typeof text !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}".`);
      return key;
    }

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        text = text.replace(new RegExp(`{${placeholder}}`, 'g'), String(replacements[placeholder]));
      });
    }

    return text;
  }, [language]);

  const value = {
    language,
    toggleLanguage,
    t,
    dir,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};