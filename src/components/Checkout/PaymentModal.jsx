// src/components/Checkout/PaymentModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";

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
  method,
  total,
  onClose,
  onSuccess,
  persistOrder, // 👈 NUEVO (async) crea+confirma+verifica y devuelve {idPedido}
}) {
  const [status, setStatus] = useState("idle"); // idle | processing | success
  const [backendStep, setBackendStep] = useState("idle"); // idle | saving | done | error
  const [orderId, setOrderId] = useState(""); // se mostrará el real si persistOrder corre OK
  const [paymentRef, setPaymentRef] = useState("");
  const [cardStep, setCardStep] = useState("detect"); // detect | processing
  const timerRef = useRef(null);

  const title = useMemo(() => {
    if (method === "Efectivo") return "Pago en efectivo";
    if (method === "Tarjeta") return "Pago con tarjeta";
    if (method === "Mercado Pago") return "Pago con Mercado Pago";
    return "Pago";
  }, [method]);

  // Simulación de cobro (igual que antes, pero reseteando estados)
  useEffect(() => {
    if (!open) return;

    setStatus("idle");
    setBackendStep("idle");
    setOrderId("");
    setPaymentRef(mkRef());
    setCardStep("detect");

    if (method === "Efectivo") {
      setStatus("processing");
      const t = setTimeout(() => {
        setOrderId(genOrderId()); // placeholder mientras no persiste
        setStatus("success");
      }, 800);
      return () => clearTimeout(t);
    }

    if (method === "Tarjeta") {
      setStatus("processing");
      const t1 = setTimeout(() => setCardStep("processing"), 900);
      const t2 = setTimeout(() => {
        setOrderId(genOrderId()); // placeholder
        setStatus("success");
      }, 900 + 1400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    // Mercado Pago
    setStatus("processing");
    timerRef.current = setTimeout(() => {
      setOrderId(genOrderId()); // placeholder
      setStatus("success");
    }, 3200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, method]);

  // Cuando el pago simulado termina en success → persistimos en BD (si pasaron persistOrder)
  useEffect(() => {
    let cancelled = false;
    async function go() {
      if (status !== "success") return;
      if (!persistOrder) return; // si no nos pasan función, no hacemos nada extra

      try {
        setBackendStep("saving");
        const { idPedido } = await persistOrder();
        if (cancelled) return;
        setOrderId(String(idPedido)); // id real
        setBackendStep("done");
      } catch (e) {
        if (cancelled) return;
        console.error("Persistencia falló:", e);
        setBackendStep("error");
      }
    }
    go();
    return () => {
      cancelled = true;
    };
  }, [status, persistOrder]);

  if (!open) return null;

  const showingSaving = status === "success" && backendStep === "saving";
  const showingError = status === "success" && backendStep === "error";
  const showingDone =
    status === "success" && (!persistOrder || backendStep === "done");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <header className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700"
            disabled={status === "processing" || backendStep === "saving"}
            aria-label="Cerrar modal"
            title="Cerrar"
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Monto */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
            <div className="text-xs text-amber-900/80">Monto a cobrar</div>
            <div className="text-xl font-semibold text-amber-900">
              ${Number(total).toFixed(2)}
            </div>
          </div>

          {/* TARJETA */}
          {method === "Tarjeta" && status !== "success" && (
            <div className="space-y-4">
              <div className="grid place-items-center">
                <div className="w-28 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 relative shadow-md">
                  <div className="absolute left-3 top-3 w-8 h-5 rounded bg-yellow-300/90" />
                  <div className="absolute right-3 bottom-3 w-10 h-2 rounded bg-white/70" />
                </div>
              </div>

              {cardStep === "detect" ? (
                <p className="text-sm">Acercá o insertá la tarjeta en el POS…</p>
              ) : (
                <p className="text-sm">Procesando pago…</p>
              )}

              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-zinc-300 border-t-amber-400 animate-spin" />
                {cardStep === "detect"
                  ? "Detectando tarjeta"
                  : "Comunicando con el banco"}
              </div>

              <div className="flex items-center justify-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    cardStep === "detect" ? "bg-amber-400" : "bg-amber-200"
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    cardStep === "processing" ? "bg-amber-400" : "bg-amber-200"
                  }`}
                />
                <span className="w-2 h-2 rounded-full bg-amber-200" />
              </div>
            </div>
          )}

          {/* MERCADO PAGO */}
          {method === "Mercado Pago" && status !== "success" && (
            <div className="space-y-3">
              <p className="text-sm">
                Escaneá el código QR desde tu app de Mercado Pago…
              </p>
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
                Ref: {paymentRef}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-zinc-300 border-t-amber-400 animate-spin" />
                Esperando confirmación…
              </div>
            </div>
          )}

          {/* EFECTIVO */}
          {method === "Efectivo" && status !== "success" && (
            <p className="text-sm">
              Acercate a la caja para realizar el pago. ¡Gracias! 🙌
            </p>
          )}

          {/* SUCCESS + persistencia */}
          {status === "success" && (
            <div className="space-y-3">
              {showingSaving && (
                <>
                  <p className="text-sm">Pago aprobado ✅</p>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-zinc-300 border-t-amber-400 animate-spin" />
                    Registrando pedido…
                  </div>
                </>
              )}

              {showingError && (
                <>
                  <p className="text-sm text-red-600">
                    No pudimos registrar el pedido.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Tu pago se simuló OK, pero falló la persistencia. Podés
                    reintentar o cerrar.
                  </p>
                </>
              )}

              {showingDone && (
                <>
                  <p className="text-sm">¡Pago confirmado! 🎉</p>
                  <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2">
                    <div className="text-xs text-green-800/80">Nº de pedido</div>
                    <div className="text-lg font-semibold text-green-800">
                      {orderId}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Conservá tu número para retirar el pedido en el mostrador.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-5 border-t flex gap-3">
          {status !== "success" ? (
            <>
              <button
                onClick={onClose}
                disabled={status === "processing"}
                className="flex-1 h-11 rounded-xl border"
              >
                Cancelar
              </button>
              <button
                disabled
                className="flex-1 h-11 rounded-xl bg-zinc-200 text-zinc-500"
              >
                Procesando…
              </button>
            </>
          ) : !persistOrder ? (
            // Sin persistencia: igual que antes
            <button
              onClick={() => onSuccess?.()}
              className="flex-1 h-11 rounded-xl bg-amber-400 hover:brightness-105 font-semibold"
            >
              Finalizar
            </button>
          ) : backendStep === "saving" ? (
            <>
              <button disabled className="flex-1 h-11 rounded-xl border">
                Cancelar
              </button>
              <button
                disabled
                className="flex-1 h-11 rounded-xl bg-zinc-200 text-zinc-500"
              >
                Registrando pedido…
              </button>
            </>
          ) : backendStep === "error" ? (
            <>
              <button onClick={onClose} className="flex-1 h-11 rounded-xl border">
                Cerrar
              </button>
              <button
                onClick={async () => {
                  try {
                    setBackendStep("saving");
                    const { idPedido } = await persistOrder();
                    setOrderId(String(idPedido));
                    setBackendStep("done");
                  } catch (e) {
                    setBackendStep("error");
                  }
                }}
                className="flex-1 h-11 rounded-xl bg-amber-400 hover:brightness-105 font-semibold"
              >
                Reintentar
              </button>
            </>
          ) : (
            // done
            <button
              onClick={() => onSuccess?.()}
              className="flex-1 h-11 rounded-xl bg-amber-400 hover:brightness-105 font-semibold"
            >
              Finalizar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
