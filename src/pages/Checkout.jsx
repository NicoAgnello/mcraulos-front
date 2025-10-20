// src/pages/Checkout.jsx
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/cartContext";
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";
import PaymentModal from "../components/Checkout/PaymentModal";
import { useState } from "react";
import {
  methodToApiName,
  buildPedidoPayload,
  postPedido,
  confirmarPagoPedido,
  getPedidoById,
} from "../utils/orders.js";

export const Checkout = () => {
  const navigate = useNavigate();
  const { totals, items, clear } = useCart();
  const [payment, setPayment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dni, setDni] = useState("");
  const [cliente, setCliente] = useState(
    JSON.parse(localStorage.getItem("cliente")) || null
  );
  const [loginMsg, setLoginMsg] = useState(null); // 👈 mensaje visual
const [loginStatus, setLoginStatus] = useState(null); // "ok" | "error" | null

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
  async function persistOrder() {
    const metodoPagoApi = methodToApiName(payment); // "efectivo" | "tarjeta" | "mercadopago"
    const payload = buildPedidoPayload({
      items,
      metodoPagoApi,
      idCliente: cliente ? cliente.id_cliente : 1,
    });

    // 1) Create
    const idPedido = await postPedido(payload);

    // 2) Confirmar pago si es tarjeta/mercadopago
    if (metodoPagoApi === "tarjeta" || metodoPagoApi === "mercadopago") {
      await confirmarPagoPedido(idPedido, metodoPagoApi);
    }

    // 3) Verificación final (aseguramos que existe)
    await getPedidoById(idPedido);

    // Devolvemos el número real para que el modal lo muestre
    return { idPedido };
  }

  const handleSuccess = () => {
    clear();
    setModalOpen(false);
    navigate("/");
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
        <span className="font-semibold text-amber-700">invitado</span>.
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
            loginStatus === "ok"
              ? "text-green-600"
              : "text-red-500"
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


            <section className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 p-4 shadow-sm mb-5">
              <h2 className="font-semibold mb-3 text-amber-900">Resumen</h2>
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-amber-800">
                <span>Total</span>
                <span>${totals.subtotal.toFixed(2)}</span>
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
        total={totals.subtotal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        persistOrder={persistOrder} // 👈 ahora persiste en tu BD y muestra el id real
      />
    </>
  );
};
