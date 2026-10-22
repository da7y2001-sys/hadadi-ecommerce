import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import CartProvider from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-center"
            gutter={10}
            toastOptions={{
              duration: 3500,
              style: {
                background: "#fff",
                color: "#253237",
                border: "1px solid #e5e5e5",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                fontSize: "14px",
                padding: "12px 16px",
              },
              success: { duration: 3000 },
              error: { duration: 5000 },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
