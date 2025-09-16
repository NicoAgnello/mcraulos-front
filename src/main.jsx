// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { I18nProvider } from './i18n/I18nProvider.jsx'
import { CartProvider } from "./state/cartContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);