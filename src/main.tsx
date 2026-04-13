import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker registration with iframe/preview guard
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if ("serviceWorker" in navigator && !isInIframe && !isPreviewHost) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW registered:", reg.scope);

        // Cache favorites on each store change
        const cacheFavorites = () => {
          try {
            const stored = localStorage.getItem("vaultify-storage");
            if (stored && reg.active) {
              const parsed = JSON.parse(stored);
              reg.active.postMessage({
                type: "CACHE_FAVORITES",
                payload: parsed.state?.favorites || [],
              });
            }
          } catch {}
        };

        // Cache on load and on storage changes
        cacheFavorites();
        window.addEventListener("storage", cacheFavorites);
      })
      .catch((err) => console.error("SW registration failed:", err));
  });
} else if (isPreviewHost || isInIframe) {
  // Unregister any existing service workers in preview/iframe contexts
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
