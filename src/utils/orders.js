// src/utils/orders.js

export function methodToApiName(uiName) {
  const m = (uiName || "").toLowerCase();
  if (m.includes("efect")) return "efectivo";
  if (m.includes("tarj")) return "tarjeta";
  if (m.includes("mercado")) return "mercadopago"; // si tu BD usa "mercado_pago", abajo mandamos id_metodo_pago también
  return m;
}

export function buildPedidoPayload({
  items,
  metodoPagoApi,
  idCliente = 1,
  cupon_code = null,
  id_metodo_pago = null,   // 👈 NUEVO: si lo tenés, lo mandamos
}) {
  return {
    productos: items.map((it) => ({
      id_producto: it.id_producto,
      notas: it.notas ?? null,
      ingredientes_personalizados: Array.isArray(it.ingredientes_personalizados)
        ? it.ingredientes_personalizados
        : [],
    })),
    metodo_pago: metodoPagoApi, // "efectivo" | "tarjeta" | "mercadopago"
    id_metodo_pago: id_metodo_pago ?? undefined, // el back acepta id o nombre
    id_cliente: idCliente,
    cupon_code: cupon_code ?? null,
  };
}

export async function postPedido(payload) {
  const res = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let json = null;
  try {
    json = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || res.statusText || "Error creando pedido";
    console.error("POST /api/pedidos -> HTTP", res.status);
    console.error("Payload enviado:", payload);
    console.error("Respuesta backend:", json);
    throw new Error(msg);
  }

  const id = json?.data?.pedido?.id_pedido;
  if (!id) {
    console.error("Respuesta inesperada de /api/pedidos:", json);
    throw new Error("La API no devolvió id_pedido");
  }
  return id;
}

export async function confirmarPagoPedido(idPedido, metodoPagoApi) {
  const res = await fetch(`/api/pedidos/${idPedido}/confirmar-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metodo_pago: metodoPagoApi }),
  });
  if (!res.ok) throw new Error(`POST /api/pedidos/${idPedido}/confirmar-pago -> ${res.status}`);
  return res.json();
}

export async function getPedidoById(id) {
  const res = await fetch(`/api/pedidos/${id}`);
  if (!res.ok) throw new Error(`GET /api/pedidos/${id} -> ${res.status}`);
  return res.json();
}
