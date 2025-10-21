import { useCart } from "../state/cartContext";
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";

export const Cart = () => {
  const { items, totals, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const { t } = useI18n();
  return (
    <>
      <HeaderMenu />
      <main className="max-w-[900px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-semibold mb-4">{t("cart_title")}</h1>
          <button
            onClick={() => navigate("/checkout")}
            className="px-6 py-2 rounded-xl bg-amber-400 hover:brightness-105 text-black font-semibold shadow-sm active:scale-[.97] transition cursor-pointer"
          >
            {t("go_to_checkout")}
          </button>
        </div>
        {items.length === 0 ? (
          <p>{t("cart_empty")}</p>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.lineId}
                  className="rounded-2xl border p-3 bg-white flex items-center gap-3"
                >
                  <img
                    src={it.imagen || "/placeholder-burger.png"}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{it.nombre}</div>
                    <div className="text-sm text-zinc-500">
                      ${it.precio_unit.toFixed(2)} · {t("line_subtotal")}: $
                      {(it.precio_unit * it.qty).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(it.lineId, Math.max(1, it.qty - 1))}
                      className="w-8 h-8 rounded-full border"
                    >
                      –
                    </button>
                    <span className="w-8 text-center">{it.qty}</span>
                    <button
                      onClick={() => setQty(it.lineId, it.qty + 1)}
                      className="w-8 h-8 rounded-full border"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(it.lineId)}
                    className="px-3 h-9 rounded-lg border text-red-600"
                  >
                    {t("remove")}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={clear}
                className="text-xm cursor-pointer text-red-600 underline"
              >
                {t("empty_cart")}
              </button>
              <div className="text-right">
                <div className="text-sm text-zinc-500">{t("total")}</div>
                <div className="text-2xl font-semibold">
                  ${totals.subtotal.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
};
