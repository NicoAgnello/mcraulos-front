// src/components/LenguageSelector/LenguageSelector.jsx
import { useState } from "react";
import esFlag from "../../assets/flags/flag-es.svg";
import ptFlag from "../../assets/flags/flag-pt.svg";
import enFlag from "../../assets/flags/flag-en.svg"
import frFlag from "../../assets/flags/flag-fr.svg"

const LANGS = [
  { code: "es", flag: esFlag, label: "Español" },
  { code: "en", flag: enFlag, label: "English" },
  { code: "pt", flag: ptFlag, label: "Português" },
  { code: "fr", flag: frFlag, label: "Français" },
];

export const LanguageSelector = ({ defaultValue = "es", onChange }) => {
  const [selected, setSelected] = useState(defaultValue);

  const handleSelect = (code) => {
    setSelected(code);
    onChange?.(code);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <section className="w-full max-w-4xl mx-auto mt-10">
      <h2 className="text-center text-white/90 text-2xl font-semibold mb-6">
        Selecciona tu idioma
      </h2>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {LANGS.map((l) => {
          const active = selected === l.code;
          return (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => handleSelect(l.code)}
                className={[
                  "relative h-32 w-full rounded-xl overflow-hidden shadow-lg",
                  "transition-all duration-300 focus:outline-none",
                  active
                    ? "ring-4 ring-yellow-400 scale-[1.03]"
                    : "hover:scale-105 hover:ring-2 hover:ring-white/50",
                ].join(" ")}
                aria-label={l.label}
                aria-pressed={active}
              >
                {/* Fondo bandera */}
                <img
                  src={l.flag}
                  alt={l.label}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  draggable="false"
                />
                {/* Overlay sutil para legibilidad */}
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                {/* Referencia corta */}
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
