// src/pages/Checkout.jsx
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/cartContext";
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";
import PaymentModal from "../components/Checkout/PaymentModal";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import CouponSelect from "../components/Checkout/CuponSelect.jsx"; // ✅ externo, limpio
import {
  buildPedidoPayload,
  postPedido,
  confirmarPagoPedido,
  getPedidoById,
} from "../utils/orders.js";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { SiMercadopago } from "react-icons/si";
export const Checkout = () => {
  const navigate = useNavigate();
  const { totals, items, clear } = useCart();
  const { t } = useI18n();

  const [payment, setPayment] = useState(""); // "efectivo" | "tarjeta" | "mercadopago"
  const [modalOpen, setModalOpen] = useState(false);
  const [dni, setDni] = useState("");
  const [cliente, setCliente] = useState(
    JSON.parse(localStorage.getItem("cliente")) || null
  );
  const [loginMsg, setLoginMsg] = useState(null); // mensaje visual
  const [loginStatus, setLoginStatus] = useState(null); // "ok" | "error" | null

  // Cupón aplicado
  const [appliedCoupon, setAppliedCoupon] = useState(null); // {code, discount, totalWithDiscount} | null

  const subtotal = useMemo(() => totals?.subtotal ?? 0, [totals]);
  const totalToPay = appliedCoupon?.totalWithDiscount ?? subtotal;
  const idCliente = cliente ? cliente.id_cliente : null; // null => invitado

  // ✅ si el cliente deja de estar logueado, limpiamos cupón
  useEffect(() => {
    if (!idCliente && appliedCoupon) {
      setAppliedCoupon(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  const handleLogin = async () => {
    const limpio = dni.replace(/\D/g, "");
    if (!limpio) {
      setLoginMsg(t("enter_valid_dni"));
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
        setCliente(data.data);
        localStorage.setItem("cliente", JSON.stringify(data.data));
        setLoginMsg(t("session_ok"));
        setLoginStatus("ok");
        setDni("");
      } else {
        setCliente(null);
        localStorage.removeItem("cliente");
        setLoginMsg(data.message || t("dni_not_exists"));
        setLoginStatus("error");
      }
    } catch (error) {
      console.error(error);
      setLoginMsg(t("server_connect_error"));
      setLoginStatus("error");
    }

    setTimeout(() => {
      setLoginMsg(null);
      setLoginStatus(null);
    }, 4000);
  };

  const handleConfirm = () => {
    if (!payment) {
      alert(t("choose_payment_before_continue"));
      return;
    }
    if (items.length === 0) {
      alert(t("cart_empty"));
      return;
    }
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  // La ejecuta el modal cuando el pago simulado queda "success"
  async function persistOrder() {
    const metodoPagoApi = payment; // ya es "efectivo" | "tarjeta" | "mercadopago"

    const productosParaPedido = [...items];
    if (!productosParaPedido || productosParaPedido.length === 0) {
      console.error("Carrito vacío al persistir el pedido");
      throw new Error(t("cart_empty"));
    }

    const payload = buildPedidoPayload({
      items: productosParaPedido,
      metodoPagoApi,
      idCliente: cliente ? cliente.id_cliente : 1,
      cupon_code: appliedCoupon?.code ?? null,
      id_metodo_pago: totals?.id_metodo_pago ?? null,
    });

    console.log("Enviando pedido:", payload);

    // 1) Crear pedido
    const idPedido = await postPedido(payload);

    // 2) Confirmar pago si aplica
    if (payment === "tarjeta" || payment === "mercadopago") {
      await confirmarPagoPedido(idPedido, metodoPagoApi);
    }

    // 3) Verificación final
    await getPedidoById(idPedido);

    return { idPedido };
  }

  const handleSuccess = () => {
    try {
      clear(); // limpia carrito
      localStorage.removeItem("cliente");
      setCliente(null);
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
          {t("payment_methods_title")}
        </h1>
        <p className="text-center text-zinc-600 mb-8">
          {t("almost_done_choose_pay")}
        </p>

        {items.length === 0 ? (
          <p className="text-center text-zinc-500">{t("cart_empty_brief")}</p>
        ) : (
          <>
            {/* Métodos de pago */}
            <section className="mb-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Efectivo */}
                <label
                  className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 cursor-pointer transition-all duration-200 
        ${
          payment === "efectivo"
            ? "border-yellow-400 bg-green-50 scale-[1.03]"
            : "border-zinc-300 hover:border-yellow-400 hover:scale-[1.02] bg-white"
        }`}
                  onClick={() => setPayment("efectivo")}
                >
                  <FaMoneyBillWave className="text-3xl text-green-600" />
                  <span className="font-semibold text-zinc-800">
                    {t("cash")}
                  </span>
                </label>

                {/* Tarjeta */}
                <label
                  className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 cursor-pointer transition-all duration-200 
        ${
          payment === "tarjeta"
            ? "border-yellow-400 bg-blue-50 scale-[1.03]"
            : "border-zinc-300 hover:border-yellow-400 hover:scale-[1.02] bg-white"
        }`}
                  onClick={() => setPayment("tarjeta")}
                >
                  <FaCreditCard className="text-3xl text-blue-600" />
                  <span className="font-semibold text-zinc-800">
                    {t("card")}
                  </span>
                </label>

                {/* Mercado Pago */}
                <label
                  className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 cursor-pointer transition-all duration-200 
        ${
          payment === "mercadopago"
            ? "border-yellow-400 bg-sky-50 scale-[1.03]"
            : "border-zinc-300 hover:border-yellow-400 hover:scale-[1.02] bg-white"
        }`}
                  onClick={() => setPayment("mercadopago")}
                >
                  <SiMercadopago className="text-3xl text-sky-600" />
                  <span className="font-semibold text-zinc-800">
                    {t("mercado_pago")}
                  </span>
                </label>
              </div>
            </section>

            {/* LOGIN CLIENTE + (si hay cliente) CUPONES dentro del mismo panel */}
            <section className="mb-6 rounded-2xl border border-zinc-200 p-4 bg-white shadow-sm">
              <h2 className="font-semibold mb-2">{t("identify_title")}</h2>

              {!cliente ? (
                <>
                  <div className="mb-2 text-xs text-zinc-500">
                    {t("you_are_buying_as")}{" "}
                    <span className="font-semibold text-amber-700">
                      {t("guest")}
                    </span>
                    .
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder={t("dni_placeholder")}
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="border rounded-lg p-2 flex-1 focus:ring-2 focus:ring-amber-300 outline-none"
                    />
                    <button
                      onClick={handleLogin}
                      className="bg-amber-400 hover:brightness-105 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      {t("login_button")}
                    </button>
                  </div>

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
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-700">
                      {t("welcome_name").replace("{{name}}", cliente.nombre)}
                    </span>
                    <button
                      onClick={() => {
                        setCliente(null);
                        localStorage.removeItem("cliente");
                      }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      {t("logout")}
                    </button>
                  </div>

                  {/* Cupón integrado en el mismo bloque */}
                  <CouponSelect
                    subtotal={subtotal}
                    idCliente={idCliente}
                    onApplied={(info) => setAppliedCoupon(info)}
                    onCleared={() => setAppliedCoupon(null)}
                  />
                </>
              )}
            </section>

            {/* RESUMEN */}
            <section className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 p-4 shadow-sm mb-5">
              <h2 className="font-semibold mb-3 text-amber-900">
                {t("summary")}
              </h2>
              <div className="flex justify-between text-sm mb-1">
                <span>{t("subtotal")}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-700 mb-1">
                  <span>
                    {t("discount_with_code").replace(
                      "{{code}}",
                      appliedCoupon.code
                    )}
                  </span>
                  <span>- ${appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-amber-800">
                <span>{t("total")}</span>
                <span>${totalToPay.toFixed(2)}</span>
              </div>
            </section>

            <div className="text-center">
              <button
                onClick={handleConfirm}
                disabled={!payment || items.length === 0}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-amber-400 font-semibold text-black hover:brightness-105 active:scale-[.98] disabled:opacity-50 transition"
              >
                {t("confirm_purchase")}
              </button>
            </div>
          </>
        )}
      </main>

      <PaymentModal
        open={modalOpen}
        methodKey={payment} // ✅ pasamos la key estable
        total={totalToPay} // total ya con descuento si aplica
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        persistOrder={persistOrder} // persiste y muestra el id real
      />
    </>
  );
};
