import { createContext, useContext, useState, useEffect } from "react";
import ar from "../locales/ar";
import en from "../locales/en";

const dictionaries = { ar, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("app_lang");
    return saved === "en" || saved === "ar" ? saved : "ar"; // Default is Arabic
  });

  const setLanguage = (newLang) => {
    if (newLang === "ar" || newLang === "en") {
      setLanguageState(newLang);
      localStorage.setItem("app_lang", newLang);
    }
  };

  const toggleLanguage = () => {
    const next = language === "ar" ? "en" : "ar";
    setLanguage(next);
  };

  useEffect(() => {
    document.documentElement.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const t = (key, params = {}) => {
    const dict = dictionaries[language] || dictionaries.ar;
    let translation = dict[key] || dictionaries.en[key] || key;

    if (params && typeof params === "object") {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(
          new RegExp(`\\{${paramKey}\\}`, "g"),
          params[paramKey]
        );
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL: language === "ar",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// This module intentionally exports the provider and its hook together.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageProvider;
