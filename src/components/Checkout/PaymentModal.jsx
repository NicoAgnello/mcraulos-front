import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { useI18n } from "../../i18n/I18nProvider.jsx";

function mkRef() {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MP|MCraulos|${Date.now()}|${rnd}`;
}

function genOrderId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `MR-${n}`;
}

export default function PaymentModal({
  open,
  methodKey,
  method,
  total,
  onClose,
  onSuccess,
  persistOrder, // async → devuelve { idPedido }
}) {
  const { t } = useI18n();

  // Estados
  const [status, setStatus] = useState("idle"); // idle | processing | success
  const [backendStep, setBackendStep] = useState("idle"); // idle | saving | done | error
  const [orderId, setOrderId] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [cardStep, setCardStep] = useState("detect");
  const [pointsInfo, setPointsInfo] = useState(null);
  const timerRef = useRef(null);
  const persistedOnceRef = useRef(false);

  // ✅ método normalizado
  const normalizedMethod =
    methodKey ||
    (method === "Efectivo"
      ? "efectivo"
      : method === "Tarjeta"
      ? "tarjeta"
      : method === "Mercado Pago"
      ? "mercadopago"
      : null);

  const title = useMemo(() => {
    if (normalizedMethod === "efectivo") return t("cash");
    if (normalizedMethod === "tarjeta") return t("card");
    if (normalizedMethod === "mercadopago") return t("mercado_pago");
    return "Pago";
  }, [normalizedMethod, t]);

  // Bloqueo de cierre tras pagar
  const lockClose = status === "success" && backendStep !== "error";

  // Reset al abrir/cerrar
  useEffect(() => {
    if (!open) return;

    setStatus("idle");
    setBackendStep("idle");
    setOrderId("");
    setPaymentRef(mkRef());
    setCardStep("detect");
    setPointsInfo(null);
    persistedOnceRef.current = false;

    // Simulaciones por método
    if (normalizedMethod === "efectivo") {
      setStatus("processing");
      const t = setTimeout(() => {
        setOrderId(genOrderId());
        setStatus("success");
      }, 800);
      return () => clearTimeout(t);
    }

    if (normalizedMethod === "tarjeta") {
      setStatus("processing");
      const t1 = setTimeout(() => setCardStep("processing"), 900);
      const t2 = setTimeout(() => {
        setOrderId(genOrderId());
        setStatus("success");
      }, 2300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    if (normalizedMethod === "mercadopago") {
      setStatus("processing");
      timerRef.current = setTimeout(() => {
        setOrderId(genOrderId());
        setStatus("success");
      }, 3200);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [open, normalizedMethod]);

  // Persistir pedido
  useEffect(() => {
    let cancelled = false;
    async function go() {
      if (status !== "success") return;
      if (!persistOrder) return;
      if (persistedOnceRef.current) return;
      persistedOnceRef.current = true;

      try {
        setBackendStep("saving");
        const { idPedido } = await persistOrder();
        if (cancelled) return;
        setOrderId(String(idPedido));
        setBackendStep("done");
      } catch (e) {
        if (!cancelled) setBackendStep("error");
      }
    }
    go();
    return () => {
      cancelled = true;
    };
  }, [status, persistOrder]);

  // Traer puntos ganados
  useEffect(() => {
    let cancelled = false;
    async function fetchPoints() {
      if (backendStep !== "done" || !orderId) return;
      try {
        const res = await fetch(`/api/pedidos/${orderId}/puntos`);
        const json = await res.json();
        if (!cancelled && res.ok && json.status === "OK") {
          setPointsInfo(json.data);
        }
      } catch (_) {}
    }
    fetchPoints();
    return () => {
      cancelled = true;
    };
  }, [backendStep, orderId]);

  if (!open) return null;

  const showingSaving = status === "success" && backendStep === "saving";
  const showingError = status === "success" && backendStep === "error";
  const showingDone =
    status === "success" && (!persistOrder || backendStep === "done");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
        <header className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={() => {
              if (!lockClose) onClose();
            }}
            className={`text-zinc-500 hover:text-zinc-700 ${
              lockClose ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={
              lockClose || status === "processing" || backendStep === "saving"
            }
            aria-label={t("close")}
            title={t("close")}
          >
            ✕
          </button>
        </header>

        <div className="p-5 space-y-4">
          {/* MONTO */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
            <div className="text-xs text-amber-900/80">
              {t("amount_to_charge")}
            </div>
            <div className="text-xl font-semibold text-amber-900">
              ${Number(total).toFixed(2)}
            </div>
          </div>

          {/* TARJETA */}
          {normalizedMethod === "tarjeta" && status !== "success" && (
            <div className="space-y-4">
              <div className="grid place-items-center">
                <div className="w-28 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 relative shadow-md">
                  <div className="absolute left-3 top-3 w-8 h-5 rounded bg-yellow-300/90" />
                  <div className="absolute right-3 bottom-3 w-10 h-2 rounded bg-white/70" />
                </div>
              </div>
              <p className="text-sm">
                {cardStep === "detect"
                  ? t("card_insert_or_tap")
                  : t("processing_payment")}
              </p>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-zinc-300 border-t-amber-400 animate-spin" />
                {cardStep === "detect"
                  ? t("detecting_card")
                  : t("contacting_bank")}
              </div>
            </div>
          )}

          {/* MERCADO PAGO */}
          {normalizedMethod === "mercadopago" && status !== "success" && (
            <div className="space-y-3">
              <p className="text-sm">{t("scan_qr")}</p>
              <div className="grid place-items-center">
                <div className="p-3 rounded-lg bg-white shadow-sm">
                  <QRCode
                    value={JSON.stringify({
                      v: 1,
                      ref: paymentRef,
                      method: "mercado-pago",
                      amount: Number(total).toFixed(2),
                      currency: "ARS",
                    })}
                    size={160}
                    style={{ height: "160px", width: "160px" }}
                  />
                </div>
              </div>
              <div className="text-center text-xs text-zinc-500">
                {t("ref")}: {paymentRef}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-zinc-300 border-t-amber-400 animate-spin" />
                {t("waiting_confirmation")}
              </div>
            </div>
          )}

          {/* EFECTIVO */}
          {normalizedMethod === "efectivo" && status !== "success" && (
            <p className="text-sm">{t("go_to_cash")} 🙌</p>
          )}

          {/* ESTADOS */}
          {status === "success" && (
            <div className="space-y-3 text-center">
              {showingSaving && (
                <>
                  <p className="text-sm">{t("approved")} ✅</p>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 justify-center">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-zinc-300 border-t-amber-400 animate-spin" />
                    {t("registering_order")}
                  </div>
                </>
              )}
              {showingError && (
                <>
                  <p className="text-sm text-red-600">
                    {t("could_not_register")}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t("simulated_ok_but_failed")}
                  </p>
                </>
              )}
              {showingDone && (
                <>
                  <p className="text-lg font-semibold text-green-700">
                    {t("payment_confirmed")} 🎉
                  </p>
                  <p className="text-sm text-green-600/80">
                    {t("order_registered_ok")}
                  </p>
                  <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2">
                    <div className="text-xs text-green-800/80">
                      {t("order_number")}
                    </div>
                    <div className="text-2xl font-extrabold text-green-900 tracking-wide mt-1">
                      {orderId}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {t("keep_for_pickup")} 🍔
                  </p>
                  <p className="text-sm mt-2">{t("thanks_purchase")} 🙌</p>

                  {pointsInfo &&
                    Number(pointsInfo.cliente) !== 1 &&
                    Number(pointsInfo.puntos_ganados) > 0 && (
                      <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-900 inline-block">
                        <div className="font-semibold text-lg">
                        🏆{" "}
                          {t("earned_coins").replace(
                            "{{n}}",
                            pointsInfo.puntos_ganados
                          )}
                        </div>
                        <p className="text-xs text-amber-800/70 mt-1">
                          {t("added_to_account")}
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="p-5 border-t flex gap-3">
          {status !== "success" ? (
            <>
              <button
                onClick={onClose}
                disabled={status === "processing"}
                className="flex-1 h-11 rounded-xl border"
              >
                {t("cancel")}
              </button>
              <button
                disabled
                className="flex-1 h-11 rounded-xl bg-zinc-200 text-zinc-500"
              >
                {t("processing")}
              </button>
            </>
          ) : !persistOrder ? (
            <button
              onClick={() => onSuccess?.()}
              className="flex-1 h-11 rounded-xl bg-amber-400 hover:brightness-105 font-semibold"
            >
              {t("finalize")}
            </button>
          ) : backendStep === "saving" ? (
            <>
              <button disabled className="flex-1 h-11 rounded-xl border">
                {t("cancel")}
              </button>
              <button
                disabled
                className="flex-1 h-11 rounded-xl bg-zinc-200 text-zinc-500"
              >
                {t("registering_order")}
              </button>
            </>
          ) : backendStep === "error" ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border"
              >
                {t("close")}
              </button>
              <button
                onClick={async () => {
                  try {
                    setBackendStep("saving");
                    const { idPedido } = await persistOrder();
                    setOrderId(String(idPedido));
                    setBackendStep("done");
                  } catch {
                    setBackendStep("error");
                  }
                }}
                className="flex-1 h-11 rounded-xl bg-amber-400 hover:brightness-105 font-semibold"
              >
                {t("retry")}
              </button>
            </>
          ) : (
            <button
              onClick={() => onSuccess?.()}
              className="flex-1 h-11 rounded-xl bg-amber-400 hover:brightness-105 font-semibold"
            >
              {t("finalize")}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
