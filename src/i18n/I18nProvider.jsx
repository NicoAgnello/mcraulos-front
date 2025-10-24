import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DICTS = {
  es: {
    // generales
    welcome: "¡Bienvenido!",
    select_language: "Selecciona tu idioma",

    // service mode
    service_question: "¿Cómo querés tu pedido?",
    dine_in: "Comer aquí",
    take_away: "Para llevar",

    // checkout / modal pago
    amount_to_charge: "Monto a cobrar",
    card_insert_or_tap: "Acercá o insertá la tarjeta en el POS…",
    detecting_card: "Detectando tarjeta",
    contacting_bank: "Comunicando con el banco",
    processing_payment: "Procesando pago…",
    scan_qr: "Escaneá el código QR desde tu app de Mercado Pago…",
    waiting_confirmation: "Esperando confirmación…",
    ref: "Ref",
    go_to_cash: "Acercate a la caja para realizar el pago. ¡Gracias!",
    payment_confirmed: "¡Pago confirmado!",
    order_registered_ok: "Tu pedido fue registrado correctamente",
    order_number: "Nº de pedido",
    keep_for_pickup:
      "Conservá este número para retirar el pedido en el mostrador.",
    thanks_purchase: "¡Gracias por tu compra!",
    registering_order: "Registrando pedido…",
    approved: "Pago aprobado",
    could_not_register: "No pudimos registrar el pedido.",
    simulated_ok_but_failed:
      "Tu pago se simuló OK, pero falló la persistencia. Podés reintentar o cerrar.",
    earned_coins: "Ganaste {{n}} RauloCoins",
    added_to_account: "¡Sumados automáticamente a tu cuenta!",
    checkout_title: "Resumen del pedido",
    confirm_payment: "Confirmar pago",
    payment_method: "Método de pago",
    choose_payment_method: "Elegí tu método de pago",
    total_to_pay: "Total a pagar",
    back_to_cart: "Volver al carrito",
    no_items_checkout: "No hay productos en el pedido.",
    cash: "Efectivo",
    card: "Tarjeta",
    mercado_pago: "Mercado Pago",
    payment_methods_title: "Medios de pago",
    almost_done_choose_pay:
      "Ya casi terminás tu pedido 😋 Elegí cómo querés pagar",
    cart_empty_brief: "Tu carrito está vacío 😅",
    coupon_title: "Cupón",
    loading_short: "Cargando...",
    no_coupon: "Sin cupón",
    remove_coupon: "Quitar",
    remove_coupon_title: "Quitar cupón",
    no_coupons_available: "No hay cupones disponibles.",
    identify_title: "Identificate 🪪",
    you_are_buying_as: "Estás comprando como",
    guest: "invitado",
    dni_placeholder: "DNI (sin puntos)",
    login_button: "Ingresar",
    welcome_name: "Bienvenido, {{name}}",
    logout: "Cerrar sesión",
    summary: "Resumen",
    discount_with_code: "Descuento ({{code}})",
    confirm_purchase: "Confirmar compra",
    enter_valid_dni: "Ingresá un DNI válido.",
    session_ok: "Sesión iniciada correctamente ✅",
    dni_not_exists: "No existe un cliente con ese DNI.",
    server_connect_error: "Error al conectar con el servidor.",
    choose_payment_before_continue:
      "Elegí un método de pago antes de continuar.",
    coupon_title: "Cupón",
    loading_short: "Cargando...",
    no_coupon: "Sin cupón",
    remove_coupon: "Quitar",
    remove_coupon_title: "Quitar cupón",
    no_coupons_available: "No hay cupones disponibles.",
    coupons_load_error: "No se pudieron cargar los cupones",
    coupon_invalid: "Cupón inválido",
    coupon_applied_percent: "Aplicado {{p}}% (-${{disc}})",
    coupon_applied_amount: "Descuento -${{disc}}",

    // Menu
    subtotal: "Subtotal",
    item_singular: "ítem",
    item_plural: "ítems",
    go_to_cart: "Ir al carrito",
    add_to_cart: "Agregar",
    remove_one: "Quitar uno",
    add_one: "Agregar uno",
    categories: "Categorías",
    tab_burgers: "Hamburguesas",
    tab_fries: "Papas",
    tab_drinks: "Bebidas",
    menu_load_error: "No pudimos cargar el menú.",
    product_generic: "Producto",

    //Carrito
    cart_title: "Tu carrito",
    go_to_checkout: "Ir a pagar",
    cart_empty: "Tu carrito está vacío.",
    line_subtotal: "Subtotal línea",
    remove: "Eliminar",
    empty_cart: "Vaciar carrito",
    total: "Total",

    // botones
    cancel: "Cancelar",
    processing: "Procesando…",
    finalize: "Finalizar",
    retry: "Reintentar",
    close: "Cerrar",

    // estados genéricos
    loading: "Cargando…",
    error_loading_products: "Error cargando productos",
  },
  en: {
    // general
    welcome: "Welcome!",
    select_language: "Choose your language",

    // service mode
    service_question: "How would you like your order?",
    dine_in: "Dine In",
    take_away: "Take Away",

    // checkout / payment modal
    amount_to_charge: "Amount to charge",
    card_insert_or_tap: "Tap or insert your card on the POS…",
    detecting_card: "Detecting card",
    contacting_bank: "Contacting bank",
    processing_payment: "Processing payment…",
    scan_qr: "Scan the QR with your Mercado Pago app…",
    waiting_confirmation: "Waiting for confirmation…",
    ref: "Ref",
    go_to_cash: "Please go to the cash desk to pay. Thanks!",
    payment_confirmed: "Payment confirmed!",
    order_registered_ok: "Your order was registered successfully",
    order_number: "Order number",
    keep_for_pickup: "Keep this number to pick up your order at the counter.",
    thanks_purchase: "Thanks for your purchase!",
    registering_order: "Registering order…",
    approved: "Payment approved",
    could_not_register: "We couldn't register your order.",
    simulated_ok_but_failed:
      "Payment simulation succeeded but persistence failed. You can retry or close.",
    earned_coins: "You earned {{n}} RauloCoins",
    added_to_account: "Automatically added to your account!",
    checkout_title: "Order summary",
    confirm_payment: "Confirm payment",
    payment_method: "Payment method",
    choose_payment_method: "Choose your payment method",
    total_to_pay: "Total to pay",
    back_to_cart: "Back to cart",
    no_items_checkout: "No items in the order.",
    cash: "Cash",
    card: "Card",
    mercado_pago: "Mercado Pago",
    payment_methods_title: "Payment methods",
    almost_done_choose_pay: "You're almost done 😋 Choose how you want to pay",
    cart_empty_brief: "Your cart is empty 😅",
    coupon_title: "Coupon",
    loading_short: "Loading...",
    no_coupon: "No coupon",
    remove_coupon: "Remove",
    remove_coupon_title: "Remove coupon",
    no_coupons_available: "No coupons available.",
    identify_title: "Identify yourself 🪪",
    you_are_buying_as: "You are buying as",
    guest: "guest",
    dni_placeholder: "ID number",
    login_button: "Sign in",
    welcome_name: "Welcome, {{name}}",
    logout: "Sign out",
    summary: "Summary",
    discount_with_code: "Discount ({{code}})",
    confirm_purchase: "Confirm purchase",
    enter_valid_dni: "Enter a valid ID.",
    session_ok: "Signed in successfully ✅",
    dni_not_exists: "No customer found with that ID.",
    server_connect_error: "Error connecting to server.",
    choose_payment_before_continue:
      "Choose a payment method before continuing.",

    coupon_title: "Coupon",
    loading_short: "Loading...",
    no_coupon: "No coupon",
    remove_coupon: "Remove",
    remove_coupon_title: "Remove coupon",
    no_coupons_available: "No coupons available.",
    coupons_load_error: "We couldn’t load coupons",
    coupon_invalid: "Invalid coupon",
    coupon_applied_percent: "Applied {{p}}% (-${{disc}})",
    coupon_applied_amount: "Discount -${{disc}}",
    // Menu
    subtotal: "Subtotal",
    item_singular: "item",
    item_plural: "items",
    go_to_cart: "Go to cart",
    add_to_cart: "Add",
    remove_one: "Remove one",
    add_one: "Add one",
    categories: "Categories",
    tab_burgers: "Burgers",
    tab_fries: "Fries",
    tab_drinks: "Drinks",
    menu_load_error: "We couldn’t load the menu.",
    product_generic: "Product",

    // Cart
    cart_title: "Your cart",
    go_to_checkout: "Go to checkout",
    cart_empty: "Your cart is empty.",
    line_subtotal: "Line subtotal",
    remove: "Remove",
    empty_cart: "Empty cart",
    total: "Total",

    // buttons
    cancel: "Cancel",
    processing: "Processing…",
    finalize: "Finish",
    retry: "Retry",
    close: "Close",

    // generic
    loading: "Loading…",
    error_loading_products: "Error loading products",
  },
};

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const getDefault = () => localStorage.getItem("lang") || "es";
  const [lang, setLang] = useState(getDefault);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    const dict = DICTS[lang] ?? DICTS.es;
    return (key) => dict[key] ?? key; // fallback: muestra la clave
  }, [lang]);

  return (
    <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>
  );
}

export const useI18n = () => useContext(I18nCtx);
