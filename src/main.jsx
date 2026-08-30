import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles.css";

// Deferred storage cleanup
window.addEventListener("load", () => {
  try { sessionStorage.clear(); } catch { /* ignore */ }
  try { indexedDB.deleteDatabase("portfolio_ai_db"); } catch { /* ignore */ }
}, { once: true });

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
