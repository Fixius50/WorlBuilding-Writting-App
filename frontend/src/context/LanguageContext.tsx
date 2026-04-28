import React, { createContext, useContext } from 'react';
import es from '@locales/es.json';
import en from '@locales/en.json';
import { useAppStore } from '@store/useAppStore';

interface LanguageContextType {
  language: string;
  t: (key: string) => string;
  changeLanguage: (newLang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, any> = { es, en };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result = translations[language];

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    return result;
  };

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
