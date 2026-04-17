'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en.json';
import ko from './ko.json';

type Language = 'en' | 'ko';
type Translations = typeof en;

const dictionaries: Record<Language, Translations> = { en, ko };

interface LanguageContextValue {
  readonly lang: Language;
  readonly t: Translations;
  readonly toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: en,
  toggleLang: () => {},
});

export const LanguageProvider = ({ children }: { readonly children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language | null;
    if (saved && (saved === 'en' || saved === 'ko')) {
      setLang(saved);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'ko' : 'en';
      localStorage.setItem('lang', next);
      return next;
    });
  }, []);

  const value: LanguageContextValue = {
    lang,
    t: dictionaries[lang],
    toggleLang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);