import './ServiceMode.css'
import { useState } from "react";
import { IoMdRestaurant } from "react-icons/io";
import { GiPaperBagFolded } from "react-icons/gi";
import { useI18n } from "../../../i18n/I18nProvider";


export const ServiceMode = ({ onSelect }) => {
    const {lang, setLang, t} = useI18n();
    const [selected, setSelected] = useState(null);

    const handleSelect = (mode) => {
        setSelected(mode);
        onSelect?.(mode); // si el padre quiere saber cuál se eligió
        if (navigator.vibrate) navigator.vibrate(30); // feedback
    };

    return (
      <>
        <section className="w-full max-w-4xl mx-auto mt-10">
          <h2 className="text-center text-white/90 text-2xl font-semibold mb-6">
            {t('service_question')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Comer aquí */}
            <button
              type="button"
              onClick={() => handleSelect("dine-in")}
              className={`relative h-40 rounded-xl overflow-hidden shadow-lg transition-all duration-300 focus:outline-none
            ${
              selected === "dine-in"
                ? "ring-4 ring-yellow-400 scale-[1.02]"
                : "hover:scale-105 hover:ring-2 hover:ring-white/50"
            }`}
            >
             
              <div className="flex flex-col items-center justify-center h-40 w-full rounded-xl bg-black/50">
                <IoMdRestaurant  className="text-5xl text-yellow-400 mb-3" />
                <span className="text-white font-bold text-xl">{t('dine_in')}</span>
              </div>
            </button>

            {/* Para llevar */}
            <button
              type="button"
              onClick={() => handleSelect("take-away")}
              className={`relative h-40 rounded-xl overflow-hidden shadow-lg transition-all duration-300 focus:outline-none
            ${
              selected === "take-away"
                ? "ring-4 ring-yellow-400 scale-[1.02]"
                : "hover:scale-105 hover:ring-2 hover:ring-white/50"
            }`}
            >
              <div className="flex flex-col items-center justify-center h-40 w-full rounded-xl bg-black/50">
                <GiPaperBagFolded className="text-5xl text-yellow-400 mb-3 stroke-black stroke-2" />
                <span className="text-white font-bold text-xl">{t('take_away')}</span>
              </div>
            </button>
          </div>
        </section>
      </>
    );
}