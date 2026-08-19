import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// ── Wipe ALL storage on every page load ──────────────────────────────────────
// This runs synchronously before React mounts — storage is guaranteed clean
// before any component reads from it. Covers F5, Ctrl+F5, browser restart,
// and tab close/reopen. Console output intentionally removed from production.
(function clearAllChatStorage() {
  try { localStorage.clear(); } catch { /* ignore */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
  try { indexedDB.deleteDatabase('portfolio_ai_db'); } catch { /* ignore */ }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
