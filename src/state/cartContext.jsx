import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

const initialState = {
  items: [], // cada item = { lineId, id_producto, nombre, imagen, precio_unit, qty, perso? }
};

function createLineId() {
  return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// si más adelante tenés personalización, usá también una key de config para no mergear
function sameProduct(a, b) {
  return a.id_producto === b.id_producto; // por ahora mergeamos por producto solamente
}

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return action.payload || initialState;

    case "ADD": {
      const { product, qty } = action;
      const line = {
        lineId: crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        id_producto: product.id_producto ?? product.id ?? product.ID,
        nombre: product.nombre,
        imagen: product.imagen ?? product.imagen_url ?? "",
        precio_unit: Number(product.precio ?? product.precio_base ?? 0),
        qty,
        categoria_id: product.categoria_id ?? null,   // 👈 importante
        perso: [],                                     // 👈 después lo usamos en “Editar”
      };
      return { ...state, items: [line, ...state.items] }; // 👈 SIEMPRE nueva línea
    }

    case "REMOVE": {
      const items = state.items.filter(it => it.lineId !== action.lineId);
      return { ...state, items };
    }

    case "SET_QTY": {
      const { lineId, qty } = action;
      const items = state.items.map(it =>
        it.lineId === lineId ? { ...it, qty: Math.max(1, qty) } : it
      );
      return { ...state, items };
    }

    case "CLEAR":
      return initialState;

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // persistencia en localStorage
  useEffect(() => {
    const raw = localStorage.getItem("mcraulos_cart_v1");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        dispatch({ type: "INIT", payload: parsed });
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("mcraulos_cart_v1", JSON.stringify(state));
  }, [state]);

  const totals = useMemo(() => {
    const count = state.items.reduce((acc, it) => acc + it.qty, 0);
    const subtotal = state.items.reduce((acc, it) => acc + it.qty * it.precio_unit, 0);
    return { count, subtotal };
  }, [state.items]);

  const api = useMemo(() => ({
    items: state.items,
    totals,
    add: (product, qty = 1) => dispatch({ type: "ADD", product, qty }),
    remove: (lineId) => dispatch({ type: "REMOVE", lineId }),
    setQty: (lineId, qty) => dispatch({ type: "SET_QTY", lineId, qty }),
    clear: () => dispatch({ type: "CLEAR" }),
  }), [state, totals]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
