import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useEffect,
} from "react";

const LS_KEY = "mcraulos_cart_v1";

const CartContext = createContext(null);

const initialState = { items: [] };

function createLineId() {
  return (
    crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { product, qty } = action;
      const line = {
        lineId: createLineId(),
        id_producto: product.id_producto ?? product.id ?? product.ID,
        nombre: product.nombre,
        imagen: product.imagen ?? product.imagen_url ?? "",
        precio_unit: Number(product.precio ?? product.precio_base ?? 0),
        qty,
      };
      return { ...state, items: [line, ...state.items] }; // siempre línea nueva
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((it) => it.lineId !== action.lineId),
      };
    case "SET_QTY":
      return {
        ...state,
        items: state.items.map((it) =>
          it.lineId === action.lineId
            ? { ...it, qty: Math.max(1, action.qty) }
            : it
        ),
      };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

function lazyInit() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : initialState;
  } catch {
    return initialState;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, lazyInit);

  // Guardar cambios (sin pisar en el primer render)
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const totals = useMemo(() => {
    const count = state.items.reduce((a, it) => a + it.qty, 0);
    const subtotal = state.items.reduce(
      (a, it) => a + it.qty * it.precio_unit,
      0
    );
    return { count, subtotal };
  }, [state.items]);

  const api = useMemo(
    () => ({
      items: state.items,
      totals,
      add: (product, qty = 1) => dispatch({ type: "ADD", product, qty }),
      remove: (lineId) => dispatch({ type: "REMOVE", lineId }),
      setQty: (lineId, qty) => dispatch({ type: "SET_QTY", lineId, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [state.items, totals]
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
};
