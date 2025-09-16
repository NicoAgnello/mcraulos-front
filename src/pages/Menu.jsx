// pages/Menu.jsx
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";
import { Tabs } from "../components/Menu/Tabs/Tabs";
import { ProductGrid } from "../components/Menu/ProductCard/ProductGrid";
import { useState, useEffect } from "react";
import {FooterMenu} from "../components/Menu/FooterMenu/FooterMenu.jsx";
import { useCart } from "../state/cartContext";

export const Menu = () => {
  const [category, setCategory] = useState("burgers");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { add, totals } = useCart();  
  const CATEGORY_IDS = { burgers: 1, fries: 3, drinks: 2 }; // 👈 tus ids actuales
useEffect(() => {
  const controller = new AbortController();

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const ENDPOINTS = {
        burgers: "/api/productos/categoria/1",
        fries:   "/api/productos/categoria/3",
        drinks:  "/api/productos/categoria/2",
      };

      const url = ENDPOINTS[category] ?? "/api/productos";
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("❗HTTP", res.status, res.statusText, txt);
        throw new Error(`HTTP ${res.status}`);
      }

      const raw = await res.json().catch(() => null);
      //console.log("✅ JSON crudo:", raw);

      // --- Normalizamos el shape:
      // puede venir como array directo o envuelto en {data} o {productos}
      const arr =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.productos) ? raw.productos :
        [];

      // --- Map al shape que espera la Card:
      const mapped = arr.map((d) => ({
        id: d.id_producto ?? d.ID,
        nombre: d.nombre ?? "Producto",
        precio: Number(d.precio_base ?? 0),
        imagen: d.imagen_url ?? "",
        descripcion: d.descripcion ?? "",
      }));

      setItems(mapped);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setErr("No pudimos cargar el menú.");
        setItems([]); // vaciamos para evitar mapas sobre undefined
      }
    } finally {
      setLoading(false);
    }
  };

  load();
  return () => controller.abort();
}, [category]);


  
  const handleAdd = (product, qty = 1) => {
    add({ ...product, categoria_id: CATEGORY_IDS[category] }, qty);
  };

  return (
    <>
      <HeaderMenu />
      <Tabs value={category} onChange={setCategory} />
      <main className="px-4 pb-28 pt-4 max-w-[1100px] mx-auto">
        {err && <p className="text-red-600">{err}</p>}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 2xl:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <ProductGrid items={items} onAdd={handleAdd} />
        )}
      </main>
      <FooterMenu subtotal={totals.subtotal} itemCount={totals.count} />
    </>
  );
};
