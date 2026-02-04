import React, { createContext, useContext, useState, useEffect } from 'react';
import es from '../locales/es.json';
import en from '../locales/en.json';

const LanguageContext = createContext();

const translations = { es, en };

export const LanguageProvider = ({ children }) => {
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

    const t = (key) => {
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

    const changeLanguage = (newLang) => {
        setLanguage(newLang);
        const savedSettings = localStorage.getItem('app_settings');
        let settings = {};
        if (savedSettings) {
            try {
                settings = JSON.parse(savedSettings);
            } catch (e) { }
        }
        localStorage.setItem('app_settings', JSON.stringify({ ...settings, language: newLang }));
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
