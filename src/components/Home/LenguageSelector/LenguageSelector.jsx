// src/components/LenguageSelector/LenguageSelector.jsx
import { useState } from "react";
import esFlag from "../../../assets/flags/flag-es.svg";
import enFlag from "../../../assets/flags/flag-en.svg";
import { useI18n } from "../../../i18n/I18nProvider";
import { useEffect } from "react";

const LANGS = [
  { code: "es", flag: esFlag, label: "Español" },
  { code: "en", flag: enFlag, label: "English" },
];

export const LanguageSelector = ({ defaultValue = "es", onChange }) => {
  const { lang, setLang, t } = useI18n();
  const [selected, setSelected] = useState(defaultValue);

  // ✅ sincroniza el “selected” si el lang global cambia
  useEffect(() => {
    setSelected(lang);
  }, [lang]);

  const handleSelect = (code) => {
    setSelected(code);
    setLang(code); // 👈 setea idioma global
    onChange?.(code); // opcional para callbacks del padre
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <section className="w-full mt-7">
      <h2 className="text-center text-white/90 text-2xl font-semibold mb-6">
        {t("select_language")}
      </h2>

      <ul className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center">
        {LANGS.map((l) => {
          const active = selected === l.code;
          return (
            <li key={l.code} className="w-60">
             <button
  type="button"
  onClick={() => handleSelect(l.code)}
  className={[
    "relative h-32 w-full max-w-64 mx-auto rounded-xl overflow-hidden shadow-lg",
    "transition-all duration-300 focus:outline-none",
active
  ? "ring-4 ring-yellow-400 scale-[1.03]" // seleccionado → amarillo
  : " hover:scale-[1.02]", // hover → amarillo
  ].join(" ")}
  aria-label={l.label}
  aria-pressed={active}
>
  <img
    src={l.flag}
    alt={l.label}
    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
    draggable="false"
  />
  {/* Fondo translúcido: un poco más claro si está activo */}
  <div
    className={`absolute inset-0 transition-colors duration-300 ${
      active ? "bg-black/20" : "bg-black/50 hover:bg-black/30"
    }`}
  />
  <span
    className={`absolute bottom-2 left-2 font-bold drop-shadow transition-colors duration-300 ${
      active ? "text-yellow-400" : "text-white"
    }`}
  >
    {l.code.toUpperCase()}
  </span>
</button>


            </li>
          );
        })}
      </ul>
    </section>
  );
};
