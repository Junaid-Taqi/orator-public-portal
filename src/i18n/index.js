import React, { createContext, useContext, useEffect, useState } from 'react';
import en from './locales/en';
import hr from './locales/hr';

const LOCALE_KEY = 'appLang';

const locales = { en, hr };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const stored = sessionStorage.getItem(LOCALE_KEY);
      return stored || 'hr'; // default Croatian
    } catch (e) {
      return 'hr';
    }
  });

  useEffect(() => {
    try { sessionStorage.setItem(LOCALE_KEY, lang); } catch (e) {}
  }, [lang]);

  const t = (key) => {
    if (!key) return '';
    const parts = key.split('.');
    let cur = locales[lang] || {};
    for (let p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else { cur = null; break; }
    }
    if (typeof cur === 'string') return cur;
    // fallback to english
    cur = locales['en'];
    for (let p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
      else { cur = key; break; }
    }
    return typeof cur === 'string' ? cur : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  return useContext(LanguageContext) || { lang: 'hr', setLang: () => {}, t: (k)=>k };
};

export default { LanguageProvider, useTranslation };
