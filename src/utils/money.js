export const money = (n, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n ?? 0);