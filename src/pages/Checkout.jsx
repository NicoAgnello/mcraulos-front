import { useNavigate } from "react-router-dom";
import { useCart } from "../state/cartContext";
import { HeaderMenu } from "../components/Menu/HeaderMenu/HeaderMenu";
import { useState } from "react";
import PaymentModal from "../components/Checkout/PaymentModal";

export const Checkout = () => {
  const navigate = useNavigate();
  const { totals, items, clear } = useCart();
  const [payment, setPayment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleConfirm = () => {
    if (!payment) {
      alert("Elegí un método de pago antes de continuar.");
      return;
    }
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  const handleSuccess = () => {
    // Pago simulado OK → limpiamos carrito y volvemos al inicio (o a una “gracias”)
    clear();
    setModalOpen(false);
    navigate("/");
  };

  return (
    <>
      <HeaderMenu />
      <main className="max-w-[700px] mx-auto px-4 py-8 transition-all duration-500 ease-out">
        <h1 className="text-2xl font-semibold text-center mb-2">
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
                disabled={!payment}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-amber-400 font-semibold text-black hover:brightness-105 active:scale-[.98] disabled:opacity-50 transition"
              >
                Confirmar compra
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modal de pago simulado */}
      <PaymentModal
        open={modalOpen}
        method={payment}
        total={totals.subtotal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </>
  );
};
