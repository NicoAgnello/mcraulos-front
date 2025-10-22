import { useState, useMemo } from "react";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { money } from "../../../utils/money";
import { useI18n } from "../../../i18n/I18nProvider.jsx";

export const ProductCard = ({
  product,
  onAdd, // (product, qty) => void
  onRemove, // (product) => void   (opcional)
  className = "",
}) => {
  const { t } = useI18n();
  const {
    id,
    nombre = t("product_generic"),
    precio = 0,
    imagen, // URL absoluta/relativa
    descripcion = "",
  } = product || {};

  const [qty, setQty] = useState(0);
  const imgSrc = useMemo(() => imagen || "/placeholder-burger.png", [imagen]);

  const dec = () => setQty((q) => Math.max(0, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const handleAdd = () => {
    if (qty <= 0) return;
    onAdd?.(product, qty); // el padre pasa cart.add
    if (navigator.vibrate) navigator.vibrate(20);
    setQty(0);
  };

  return (
    <article
      className={`group relative rounded-2xl p-[1px]  shadow-[0_6px_50px_-12px_rgba(0,0,0,.35)] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,.45)] transition-shadow ${className}`}
    >
      {/* inner */}
      <div className="rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
        {/* header image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            loading="lazy"
            src={imgSrc}
            alt={nombre}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.05]"
          />
        </div>
        {/* body */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-zinc-900 text-xl leading-tight">
              {nombre}
            </h3>
            <span className="shrink-0 px-2 py-1 rounded-full text-l bg-amber-200/70 text-amber-900 border border-amber-300">
              {money(precio)}
            </span>
          </div>

          {descripcion ? (
            <p className="mt-1 text-l text-zinc-800 line-clamp-2">
              {descripcion}
            </p>
          ) : null}

          {/* controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={dec}
                disabled={qty === 0}
                className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition"
                aria-label={t("remove_one")}
              >
                <FiMinus />
              </button>
              <span className="w-8 text-center tabular-nums font-medium">
                {qty}
              </span>
              <button
                type="button"
                onClick={inc}
                className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition"
                aria-label={t("add_one")}
              >
                <FiPlus />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-full px-4 h-10 text-sm font-semibold bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow hover:brightness-105 active:scale-[.98] transition"
            >
              <FiShoppingCart />
              {t("add_to_cart")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
