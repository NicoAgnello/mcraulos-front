// src/components/LenguageSelector/LenguageSelector.jsx
import { useState } from "react";
import esFlag from "../../../assets/flags/flag-es.svg";
import enFlag from "../../../assets/flags/flag-en.svg";

const LANGS = [
  { code: "es", flag: esFlag, label: "Español" },
  { code: "en", flag: enFlag, label: "English" },

];

export const LanguageSelector = ({ defaultValue = "es", onChange }) => {
  const [selected, setSelected] = useState(defaultValue);

  const handleSelect = (code) => {
    setSelected(code);
    onChange?.(code);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
     <section className="w-full mt-7">
      <h2 className="text-center text-white/90 text-2xl font-semibold mb-6">
        Selecciona tu idioma
      </h2>

      {/* contenedor centrado */}
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
                    ? "ring-4 ring-yellow-400 scale-[1.03]"
                    : "hover:scale-105 hover:ring-2 hover:ring-white/50",
                ].join(" ")}
                aria-label={l.label}
                aria-pressed={active}
              >
                {/* bandera como imagen para evitar issues de viewBox */}
                <img
                  src={l.flag}
                  alt={l.label}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  draggable="false"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                <span className="absolute bottom-2 left-2 text-white font-bold drop-shadow">
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
