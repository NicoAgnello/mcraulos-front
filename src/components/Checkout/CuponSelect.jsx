import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider.jsx";

export default function CouponSelect({
  subtotal,
  idCliente,
  onApplied,
  onCleared,
}) {
  const { t } = useI18n();

  const [options, setOptions] = useState([]); // cupones disponibles
  const [sel, setSel] = useState("");         // código seleccionado
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);       // {type:'ok'|'error', text}

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
        if (!res.ok) throw new Error(json.message || t("coupons_load_error"));
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
  }, [query, t]);

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
      if (!res.ok) throw new Error(json.message || t("coupon_invalid"));

      const d = json.data; // {tipo, value, discount, total_with_discount, code...}

      const successText =
        (d?.tipo || "").toLowerCase() === "porcentaje"
          ? t("coupon_applied_percent")
              .replace("{{p}}", String(d.value))
              .replace("{{disc}}", Number(d.discount).toFixed(2))
          : t("coupon_applied_amount")
              .replace("{{disc}}", Number(d.discount).toFixed(2));

      setMsg({ type: "ok", text: successText });

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
    <div className="mt-3 pt-3 border-t border-zinc-200">
      <label className="block text-sm mb-2 font-medium text-zinc-700">
        {t("coupon_title")}
      </label>
      <div className="flex gap-2">
        <select
          className="flex-1 rounded-lg bg-white border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
          value={sel}
          onChange={(e) => applySelected(e.target.value)}
          disabled={loading || options.length === 0}
        >
          <option value="">{loading ? t("loading_short") : t("no_coupon")}</option>
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
            className="rounded-lg px-3 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-sm"
            title={t("remove_coupon_title")}
          >
            {t("remove_coupon")}
          </button>
        )}
      </div>

      {msg && (
        <p
          className={`mt-2 text-sm ${
            msg.type === "ok" ? "text-green-600" : "text-red-500"
          }`}
        >
          {msg.text}
        </p>
      )}

      {!loading && options.length === 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          {t("no_coupons_available")}
        </p>
      )}
    </div>
  );
}
