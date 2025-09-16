import { useCart } from "../state/cartContext";
import { useNavigate } from "react-router-dom";
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";   
import EditLineItemModal from "../components/Cart/EditLineItemModal";
import { useEffect, useState } from "react";

export const Cart = () => {
  const { items, totals, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
    const [editing, setEditing] = useState(null); // guarda la línea que se edita
  return (
    <>
    <HeaderMenu />
    <main className="max-w-[900px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Tu carrito</h1>

      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.lineId} className="rounded-2xl border p-3 bg-white flex items-center gap-3">
                <img src={it.imagen || "/placeholder-burger.png"} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="font-medium">{it.nombre}</div>
                  <div className="text-sm text-zinc-500">
                    ${it.precio_unit.toFixed(2)} · Subtotal línea: ${(it.precio_unit * it.qty).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(it.lineId, Math.max(1, it.qty - 1))} className="w-8 h-8 rounded-full border">–</button>
                  <span className="w-8 text-center">{it.qty}</span>
                  <button onClick={() => setQty(it.lineId, it.qty + 1)} className="w-8 h-8 rounded-full border">+</button>
                </div>

                {/* 👇 Solo hamburguesas (categoria_id===1) muestran Editar */}
                {it.categoria_id === 1 && (
                  <button onClick={() => setEditing(it)} className="px-3 h-9 rounded-lg border">Editar</button>
                )}
                <button onClick={() => remove(it.lineId)} className="px-3 h-9 rounded-lg border text-red-600">Eliminar</button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={clear} className="text-sm text-red-600 underline">Vaciar carrito</button>
            <div className="text-right">
              <div className="text-sm text-zinc-500">Total</div>
              <div className="text-2xl font-semibold">${totals.subtotal.toFixed(2)}</div>
            </div>
          </div>
        </>
      )}

      {/* Modal de edición por línea */}
      <EditLineItemModal item={editing} onClose={() => setEditing(null)} />
    </main>
    </>
  );
}
