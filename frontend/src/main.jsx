import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AppearanceProvider } from "./context/AppearanceContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
          <App />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
