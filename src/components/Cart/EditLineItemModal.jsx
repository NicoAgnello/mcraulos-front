import { useCart } from "../../state/cartContext";
import { useEffect, useState } from "react";

export default function EditLineItemModal({ item, onClose }) {
  const open = Boolean(item);
  const { setQty, updateItem, remove } = useCart?.() || {};

  // si no es hamburguesa, no abrimos nada (seguridad)
  if (open && item?.categoria_id !== 1) return null;
  if (!open) return null;

  // TODO: acá vamos a cargar receta y extras y recalcular precio unitario
  // por ahora, solo dejamos botones de qty / eliminar / cerrar

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
        <header className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Editar: {item?.nombre}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700">✕</button>
        </header>

        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-600">
            (Acá va la personalización: quitar ingredientes base y agregar extras por porciones)
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(item.lineId, Math.max(1, item.qty - 1))} className="w-8 h-8 rounded-full border">–</button>
            <span className="w-8 text-center">{item.qty}</span>
            <button onClick={() => setQty(item.lineId, item.qty + 1)} className="w-8 h-8 rounded-full border">+</button>
          </div>
        </div>

        <footer className="p-5 border-t flex gap-3">
          <button onClick={() => { remove(item.lineId); onClose?.(); }} className="flex-1 h-11 rounded-xl border text-red-600">Eliminar</button>
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border">Salir</button>
          <button onClick={onClose} className="flex-1 h-11 rounded-xl bg-amber-400 hover:brightness-105 font-semibold">Guardar</button>
        </footer>
      </div>
    </div>
  );
}
