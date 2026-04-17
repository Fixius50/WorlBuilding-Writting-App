import React, { createContext, useContext, useState, useEffect } from 'react';
import es from '../locales/es.json';
import en from '../locales/en.json';

interface LanguageContextType {
 language: string;
 t: (key: string) => string;
 changeLanguage: (newLang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, any> = { es, en };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 // Load initial language from localStorage or default to 'es'
 const [language, setLanguage] = useState(() => {
 const savedSettings = localStorage.getItem('app_settings');
 if (savedSettings) {
 try {
 const settings = JSON.parse(savedSettings);
 return settings.language || 'es';
 } catch (e) {
 return 'es';
 }
 }
 return 'es';
 });

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
 const savedSettings = localStorage.getItem('app_settings');
 let settings = {};
 if (savedSettings) {
 try {
 settings = JSON.parse(savedSettings);
 } catch (e) { }
 }
 localStorage.setItem('app_settings', JSON.stringify({ ...settings, language: newLang }));
 // Disparar evento para que otros componentes (y App.tsx) se enteren
 window.dispatchEvent(new Event('storage_update'));
 };

 useEffect(() => {
 const handleSync = () => {
 const savedSettings = localStorage.getItem('app_settings');
 if (savedSettings) {
 try {
 const settings = JSON.parse(savedSettings);
 if (settings.language && settings.language !== language) {
 setLanguage(settings.language);
 }
 } catch (e) { }
 }
 };

 window.addEventListener('storage_update', handleSync);
 return () => window.removeEventListener('storage_update', handleSync);
 }, [language]);

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
