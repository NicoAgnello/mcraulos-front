import { GiHamburger, GiFrenchFries } from "react-icons/gi";
import { LuCupSoda } from "react-icons/lu";
import { useState } from "react";
import "./Tabs.css";
import { useI18n } from "../../../i18n/I18nProvider.jsx";

const DEFAULT_TABS = (t) => [
  { id: "burgers", label: t("tab_burgers"), Icon: GiHamburger },
  { id: "fries", label: t("tab_fries"), Icon: GiFrenchFries },
  { id: "drinks", label: t("tab_drinks"), Icon: LuCupSoda },
];

export function Tabs({ tabs, value, onChange }) {
  const { t } = useI18n();
  const finalTabs = tabs ?? DEFAULT_TABS(t);
  const safeTabs = tabs ?? DEFAULT_TABS(t); // 👈 garantiza que siempre haya array
  const [internal, setInternal] = useState(safeTabs[0]?.id);
  const active = value ?? internal;

  const handleSelect = (id) => {
    if (onChange) onChange(id);
    else setInternal(id);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <nav
      role="tablist"
      aria-label={t("categories")}
      className={`flex w-full h-20 overflow-x-auto`}
    >
      {safeTabs.map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(id)}
            className={`
              group flex-1 min-w-[110px] flex items-center justify-center gap-2
                 px-4 py-3 transition-all bg-tabs border-r border-black/40
              ${
                isActive
                  ? "bg-category-selected text-gray-900 shadow-md"
                  : " hover:bg-black/20"
              }
            `}
          >
            <Icon
              className={`
                text-2xl shrink-0
                ${
                  isActive
                    ? "opacity-100"
                    : "opacity-90 group-hover:opacity-100"
                }
              `}
            />
            <span className="font-semibold tracking-wide">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
