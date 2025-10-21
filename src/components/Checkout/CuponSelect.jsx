import { useEffect, useMemo, useState } from "react";

export default function CouponSelect({
  subtotal,
  idCliente,
  onApplied,
  onCleared,
}) {
  const [options, setOptions] = useState([]); // cupones disponibles
  const [sel, setSel] = useState(""); // código seleccionado
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // {type:'ok'|'error', text}

  // endpoint según esté logueado o no
  const query = useMemo(() => {
    const u = new URLSearchParams();
    if (idCliente != null) u.set("cliente", idCliente);
    return `/api/cupon/disponibles${u.toString() ? `?${u.toString()}` : ""}`;
  }, [idCliente]);

  // cargar lista de cupones
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const res = await fetch(query);
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.message || "No se pudieron cargar los cupones");
        if (!abort) setOptions(json.data ?? []);
      } catch (e) {
        if (!abort) setMsg({ type: "error", text: e.message });
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [query]);

  // aplicar / quitar cupón
  const applySelected = async (code) => {
    if (!code) {
      setSel("");
      setMsg(null);
      onCleared?.();
      return;
    }
    try {
      setLoading(true);
      setMsg(null);
      setSel(code);

      const res = await fetch("/api/cupon/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          total: subtotal,
          id_cliente: idCliente ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Cupón inválido");

      const d = json.data; // {tipo, value, discount, total_with_discount, code...}

      setMsg({
        type: "ok",
        text:
          d.tipo === "porcentaje"
            ? `Aplicado ${d.value}% (-$${Number(d.discount).toFixed(2)})`
            : `Descuento -$${Number(d.discount).toFixed(2)}`,
      });

      onApplied?.({
        code: d.code,
        discount: Number(d.discount),
        totalWithDiscount: Number(d.total_with_discount),
      });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
      onApplied?.(null);
    } finally {
      setLoading(false);
    }
  };

  // si cambia el cliente, reseteo selección
  useEffect(() => {
    setSel("");
    setMsg(null);
    onCleared?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <label className="block text-sm mb-2">Cupón disponible</label>
      <div className="flex gap-2">
        <select
          className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          value={sel}
          onChange={(e) => applySelected(e.target.value)}
          disabled={loading || options.length === 0}
        >
          <option value="">{loading ? "Cargando..." : "Sin cupón"}</option>
          {options.map((c) => {
            const tipo = (c.tipo_descuento || "").toLowerCase();
            const label =
              tipo === "porcentaje"
                ? `${c.codigo} — ${Number(c.descuento)}%`
                : `${c.codigo} — $${Number(c.descuento).toFixed(2)}`;

            return (
              <option key={c.id_cupon} value={c.codigo}>
                {label}
              </option>
            );
          })}
        </select>

        {sel && (
          <button
            type="button"
            onClick={() => applySelected("")}
            className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20"
            title="Quitar cupón"
          >
            Quitar
          </button>
        )}
      </div>

      {msg && (
        <p
          className={`mt-2 text-sm ${
            msg.type === "ok" ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
