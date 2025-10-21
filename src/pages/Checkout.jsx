// src/pages/Checkout.jsx
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/cartContext";
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";
import PaymentModal from "../components/Checkout/PaymentModal";
import { useEffect, useMemo, useState } from "react";
import {
  methodToApiName,
  buildPedidoPayload,
  postPedido,
  confirmarPagoPedido,
  getPedidoById,
} from "../utils/orders.js";

/* ──────────────────────────────────────────────────────────────
   Select de cupones inline (simple: solo "código — valor")
   ────────────────────────────────────────────────────────────── */
function CouponSelect({ subtotal, idCliente, onApplied, onCleared }) {
  const [options, setOptions] = useState([]);
  const [sel, setSel] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // {type:'ok'|'error', text}

  // Cargar cupones disponibles (cliente => personales+genéricos; invitado => genéricos)
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const qs = idCliente ? `?cliente=${idCliente}` : "";
        const res = await fetch(`/api/cupon/disponibles${qs}`);
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
  }, [idCliente]);

  // Aplicar/Quitar cupón
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

      const d = json.data; // { code, tipo, value, discount, total_with_discount }
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

  // Si cambia el cliente, reseteo
  useEffect(() => {
    setSel("");
    setMsg(null);
    onCleared?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  return (
    <div className="mb-6 rounded-2xl border border-zinc-200 p-4 bg-white shadow-sm">
      <h2 className="font-semibold mb-2">Cupón</h2>
      <div className="flex gap-2">
        <select
          className="flex-1 border rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-300 outline-none"
          value={sel}
          onChange={(e) => applySelected(e.target.value)}
          disabled={loading || options.length === 0}
        >
          <option value="">{loading ? "Cargando..." : "Sin cupón"}</option>
          {options.map((c) => {
            const tipo = (c.tipo_descuento || "").toLowerCase();
            const valor =
              tipo === "porcentaje"
                ? `${Number(c.descuento)}%`
                : `$${Number(c.descuento).toFixed(2)}`;
            // 👇 SOLO "código — valor" como pediste
            return (
              <option key={c.id_cupon} value={c.codigo}>
                {c.codigo} — {valor}
              </option>
            );
          })}
        </select>
        {sel && (
          <button
            type="button"
            onClick={() => applySelected("")}
            className="rounded-lg px-3 py-2 bg-zinc-100 hover:bg-zinc-200"
            title="Quitar cupón"
          >
            Quitar
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
          No hay cupones disponibles.
        </p>
      )}
    </div>
  );
}

export const Checkout = () => {
  const navigate = useNavigate();
  const { totals, items, clear } = useCart();

  const [payment, setPayment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dni, setDni] = useState("");
  const [cliente, setCliente] = useState(
    JSON.parse(localStorage.getItem("cliente")) || null
  );
  const [loginMsg, setLoginMsg] = useState(null); // mensaje visual
  const [loginStatus, setLoginStatus] = useState(null); // "ok" | "error" | null

  // Cupón aplicado (del select)
  const [appliedCoupon, setAppliedCoupon] = useState(null); // {code, discount, totalWithDiscount} | null

  const subtotal = useMemo(() => totals?.subtotal ?? 0, [totals]);
  const totalToPay = appliedCoupon?.totalWithDiscount ?? subtotal;
  const idCliente = cliente ? cliente.id_cliente : null; // null => invitado

  const handleLogin = async () => {
    const limpio = dni.replace(/\D/g, "");
    if (!limpio) {
      setLoginMsg("Ingresá un DNI válido.");
      setLoginStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/clientes/login-dni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: limpio }),
      });

      const data = await res.json();

      if (res.ok && data.status === "OK") {
        // ✅ Login correcto
        setCliente(data.data);
        localStorage.setItem("cliente", JSON.stringify(data.data));
        setLoginMsg("Sesión iniciada correctamente ✅");
        setLoginStatus("ok");
        setDni("");
      } else {
        // ❌ DNI no existe
        setCliente(null);
        localStorage.removeItem("cliente");
        setLoginMsg(data.message || "No existe un cliente con ese DNI.");
        setLoginStatus("error");
      }
    } catch (error) {
      console.error(error);
      setLoginMsg("Error al conectar con el servidor.");
      setLoginStatus("error");
    }

    // Ocultar el mensaje automáticamente después de unos segundos
    setTimeout(() => {
      setLoginMsg(null);
      setLoginStatus(null);
    }, 4000);
  };

  const handleConfirm = () => {
    if (!payment) {
      alert("Elegí un método de pago antes de continuar.");
      return;
    }
    if (items.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  // Esta función la ejecuta el modal cuando el pago simulado queda "success"
  // Dentro de Checkout.jsx
  async function persistOrder() {
    const metodoPagoApi = methodToApiName(payment); // "efectivo" | "tarjeta" | "mercadopago"

    // 🧠 Clonamos el carrito actual para no perderlo si cambia el estado
    const productosParaPedido = [...items];

    if (!productosParaPedido || productosParaPedido.length === 0) {
      console.error("Carrito vacío al persistir el pedido");
      throw new Error(
        "Tu carrito está vacío. Volvé al menú y agregá productos."
      );
    }

    const payload = buildPedidoPayload({
      items: productosParaPedido, // 👈 se envía el snapshot del carrito
      metodoPagoApi,
      idCliente: cliente ? cliente.id_cliente : 1,
      cupon_code: appliedCoupon?.code ?? null,
      id_metodo_pago: totals?.id_metodo_pago ?? null,
    });

    console.log("Enviando pedido:", payload);

    // 1️⃣ Crear pedido
    const idPedido = await postPedido(payload);

    // 2️⃣ Confirmar pago si aplica
    if (metodoPagoApi === "tarjeta" || metodoPagoApi === "mercadopago") {
      await confirmarPagoPedido(idPedido, metodoPagoApi);
    }

    // 3️⃣ Verificación final
    await getPedidoById(idPedido);

    return { idPedido };
  }
  const handleSuccess = () => {
    try {
      clear(); // limpia carrito
      localStorage.removeItem("cliente"); // limpia cliente persistido
      setCliente(null); // limpia estado en memoria
    } finally {
      setModalOpen(false);
      navigate("/"); // volver al home
    }
  };

  return (
    <>
      <HeaderMenu />
      <main className="max-w-[700px] mx-auto px-4 py-8 transition-all duration-500 ease-out">
        <h1 className="text-4xl font-semibold text-center mb-2">
          Medios de pago
        </h1>
        <p className="text-center text-zinc-600 mb-8">
          Ya casi terminás tu pedido 😋 Elegí cómo querés pagar
        </p>

        {items.length === 0 ? (
          <p className="text-center text-zinc-500">Tu carrito está vacío 😅</p>
        ) : (
          <>
            <div className="grid gap-4 mb-4">
              {[
                { name: "Efectivo", color: "bg-green-500/90" },
                { name: "Tarjeta", color: "bg-blue-500/90" },
                { name: "Mercado Pago", color: "bg-sky-500/90" },
              ].map((m) => (
                <label
                  key={m.name}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.name}
                    checked={payment === m.name}
                    onChange={() => setPayment(m.name)}
                  />
                  <div
                    className={`flex-1 h-12 rounded-xl ${m.color} text-white font-semibold grid place-items-center hover:brightness-110 transition`}
                  >
                    {m.name}
                  </div>
                </label>
              ))}
            </div>

            {/* LOGIN CLIENTE */}
            <section className="mb-6 rounded-2xl border border-zinc-200 p-4 bg-white shadow-sm">
              <h2 className="font-semibold mb-2">Identificate 🪪</h2>

              {!cliente ? (
                <>
                  <div className="mb-2 text-xs text-zinc-500">
                    Estás comprando como{" "}
                    <span className="font-semibold text-amber-700">
                      invitado
                    </span>
                    .
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="DNI (sin puntos)"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="border rounded-lg p-2 flex-1 focus:ring-2 focus:ring-amber-300 outline-none"
                    />
                    <button
                      onClick={handleLogin}
                      className="bg-amber-400 hover:brightness-105 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Ingresar
                    </button>
                  </div>

                  {/* Mensaje dinámico */}
                  {loginMsg && (
                    <p
                      className={`mt-3 text-sm transition-all ${
                        loginStatus === "ok" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {loginMsg}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-700">
                    Bienvenido, <strong>{cliente.nombre}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setCliente(null);
                      localStorage.removeItem("cliente");
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </section>

            {/* SELECT DE CUPONES (solo código — valor) */}
            <CouponSelect
              subtotal={subtotal}
              idCliente={idCliente}
              onApplied={(info) => setAppliedCoupon(info)}
              onCleared={() => setAppliedCoupon(null)}
            />

            {/* RESUMEN */}
            <section className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 p-4 shadow-sm mb-5">
              <h2 className="font-semibold mb-3 text-amber-900">Resumen</h2>
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-700 mb-1">
                  <span>Descuento ({appliedCoupon.code})</span>
                  <span>- ${appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-amber-800">
                <span>Total</span>
                <span>${totalToPay.toFixed(2)}</span>
              </div>
            </section>

            <div className="text-center">
              <button
                onClick={handleConfirm}
                disabled={!payment || items.length === 0}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-amber-400 font-semibold text-black hover:brightness-105 active:scale-[.98] disabled:opacity-50 transition"
              >
                Confirmar compra
              </button>
            </div>
          </>
        )}
      </main>

      <PaymentModal
        open={modalOpen}
        method={payment}
        total={totalToPay} // 👈 total ya con descuento
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        persistOrder={persistOrder} // persiste y muestra el id real
      />
    </>
  );
};
