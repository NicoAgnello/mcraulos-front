// pages/Menu.jsx
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";
import { Tabs } from "../components/Menu/Tabs/Tabs";
import { useState, useEffect } from "react";

export const Menu = () => {
  const [category, setCategory] = useState("burgers"); // lo que selecciona el Tabs
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        // ejemplo de mapeo de categoría -> endpoint
        const ENDPOINTS = {
          burgers: "/api/productos/categoria/1",
          fries: "/api/productos/categoria/2",
          drinks: "/api/productos/categoria/3",
        };

        const url = ENDPOINTS[category] ?? "/api/productos";
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // adaptá según tu shape real
        setItems(Array.isArray(json.data) ? json.data.flat() : json.data);
      } catch (e) {
        if (e.name !== "AbortError")
          setErr(e.message || "Error cargando productos");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [category]); // 👈 dispara cada vez que cambiás de pestaña
  return (
    <main className=" min-h-screen">
      <HeaderMenu />
      <Tabs value={category} onChange={setCategory} className="mb-4" />
      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-400">⚠ {err}</p>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((p) => (
          <li key={p.id_producto} className="rounded-xl border p-3">
            <h3 className="font-semibold">{p.nombre}</h3>
            <p className="text-white/70 text-sm">{p.descripcion}</p>
            <p className="mt-2">${p.precio_base}</p>
          </li>
        ))}
      </ul>
    </main>
  );
};
