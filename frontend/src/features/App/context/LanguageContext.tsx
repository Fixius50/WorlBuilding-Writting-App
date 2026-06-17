import React, { createContext, useContext } from "react";
import es from "@locales/es.json";
import en from "@locales/en.json";
import { useAppStore } from "@features/App/store/useAppStore";

interface LanguageContextType {
  language: string;
  t: (key: string) => string;
  changeLanguage: (newLang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

type TranslationNode = string | Record<string, TranslationNode>;

const translations: Record<string, TranslationNode> = { es, en };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const t = (key: string): string => {
    const keys = key.split(".");
    let result: TranslationNode | undefined = translations[language];

    for (const k of keys) {
      if (typeof result === "object" && result !== null && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }

    return typeof result === "string" ? result : key;
  };

  const changeLanguage = (newLang: string): void => {
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
