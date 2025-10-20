// src/api/orders.js

export function methodToApiName(uiName) {
  // Mapea lo que ve el usuario -> lo que espera la BD
  const m = (uiName || "").toLowerCase();
  if (m.includes("efect")) return "efectivo";
  if (m.includes("tarj")) return "tarjeta";
  if (m.includes("mercado")) return "mercadopago";
  return m;
}

export function buildPedidoPayload({ items, metodoPagoApi, idCliente = 1 }) {
  return {
    productos: items.map(it => ({
      id_producto: it.id_producto,
      notas: null,
      ingredientes_personalizados: []
    })),
    metodo_pago: metodoPagoApi, // "efectivo" | "tarjeta" | "mercadopago"
    id_cliente: idCliente
  };
}

export async function postPedido(payload) {
  const res = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/pedidos -> ${res.status}`);
  const json = await res.json();
  const id = json?.data?.pedido?.id_pedido;
  if (!id) throw new Error("POST /api/pedidos sin id_pedido en respuesta");
  return id;
}

export async function confirmarPagoPedido(idPedido, metodoPagoApi) {
  // Sólo para tarjeta / mercadopago
  const res = await fetch(`/api/pedidos/${idPedido}/confirmar-pago`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ metodo_pago: metodoPagoApi }),
  });
  if (!res.ok) throw new Error(`POST /api/pedidos/${idPedido}/confirmar-pago -> ${res.status}`);
  return res.json();
}

export async function getPedidoById(id) {
  const res = await fetch(`/api/pedidos/${id}`);
  if (!res.ok) throw new Error(`GET /api/pedidos/${id} -> ${res.status}`);
  return res.json(); // {status:'OK', data:{ pedido, cliente, productos }}
}
