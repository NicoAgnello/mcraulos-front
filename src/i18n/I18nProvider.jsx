import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DICTS = {
  es: {
    welcome: "¡Bienvenido!",
    select_language: "Selecciona tu idioma",
    service_question: "¿Cómo querés tu pedido?",
    dine_in: "Comer aquí",
    take_away: "Para llevar",
  },
  en: {
    welcome: "¡Welcome!",
    select_language: "Choose your language",
    service_question: "How would you like your order?",
    dine_in: "Dine In",
    take_away: "Take Away",
  },
};

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const getDefault = () => localStorage.getItem("lang") || "es";
  const [lang, setLang] = useState(getDefault);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    const dict = DICTS[lang] ?? DICTS.es;
    return (key) => dict[key] ?? key; // fallback: muestra la clave
  }, [lang]);

  return (
    <I18nCtx.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nCtx.Provider>
  );
}

export const useI18n = () => useContext(I18nCtx);
