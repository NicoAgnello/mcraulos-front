import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

export const FooterMenu = ({ subtotal = 0, itemCount = 0, className = "" }) =>{
  const navigate = useNavigate();
  const total = useMemo(() => Number(subtotal) || 0, [subtotal]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40
                  bg-white/90 backdrop-blur border-t
                  px-4 py-3 ${className}`}
    >
      <div className="mx-auto max-w-[1100px] flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-500">Subtotal</div>
          <div className="text-xl font-semibold leading-none">
            ${total.toFixed(2)}
          </div>
          {itemCount > 0 && (
            <div className="text-xs text-zinc-500 mt-0.5">
              {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl
                     bg-amber-400 font-semibold text-black
                     hover:brightness-105 active:scale-[.98] transition"
        >
          <FiShoppingCart />
          Ir al carrito
        </button>
      </div>
    </div>
  );
}
