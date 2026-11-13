'use client';

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import en from './en.json';
import ko from './ko.json';

type Language = 'en' | 'ko';
type Translations = typeof en;

const dictionaries: Record<Language, Translations> = { en, ko };

const STORAGE_KEY = 'lang';
const DEFAULT_LANG: Language = 'en';
const CHANGE_EVENT = 'git-tiers:lang-change';

interface LanguageContextValue {
  readonly lang: Language;
  readonly t: Translations;
  readonly toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  t: en,
  toggleLang: () => {},
});

const isLanguage = (value: string | null): value is Language => value === 'en' || value === 'ko';

// localStorage 를 못 쓰는 환경(시크릿 모드 등)에서 쓰는 이번 탭 전용 값
let memoryLang: Language | null = null;

const readStoredLang = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLanguage(saved) ? saved : DEFAULT_LANG;
  } catch {
    return memoryLang ?? DEFAULT_LANG;
  }
};

// localStorage 를 외부 저장소로 구독한다(다른 탭에서 바꿔도 따라간다).
const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

export const LanguageProvider = ({ children }: { readonly children: React.ReactNode }) => {
  // 서버 렌더와 첫 하이드레이션은 기본 언어, 이후 저장된 언어로 바뀐다(기존 동작과 같음).
  const lang = useSyncExternalStore(subscribe, readStoredLang, () => DEFAULT_LANG);

  const toggleLang = useCallback(() => {
    const next: Language = readStoredLang() === 'en' ? 'ko' : 'en';
    memoryLang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 저장이 막혀 있으면 memoryLang 으로 이번 탭에서만 바뀐다.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value: LanguageContextValue = {
    lang,
    t: dictionaries[lang],
    toggleLang,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
