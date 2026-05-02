import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { mountAfriChatWidget } from "@/lib/africhat";

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
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.endsWith(".vercel.app") ||
  window.location.hostname.includes("vercel");

const shouldRegisterServiceWorker =
  import.meta.env.PROD && !isInIframe && !isPreviewHost;

if ("serviceWorker" in navigator && shouldRegisterServiceWorker) {
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
          } catch (error) {
            void error;
          }
        };

        // Cache on load and on storage changes
        cacheFavorites();
        window.addEventListener("storage", cacheFavorites);
      })
      .catch((err) => console.error("SW registration failed:", err));
  });
} else {
  // Dev/preview/iframe contexts must stay SW-free to avoid stale module caches.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
      .catch(() => undefined);
  }

  caches
    .keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("vaultify-")).map((k) => caches.delete(k))))
    .catch(() => undefined);

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    sessionStorage.setItem("vaultify-dev-clean", "1");
  }
}

if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && !sessionStorage.getItem("vaultify-dev-reloaded")) {
  const marked = sessionStorage.getItem("vaultify-dev-clean") === "1";
  if (marked) {
    sessionStorage.setItem("vaultify-dev-reloaded", "1");
    window.location.reload();
  }
}

createRoot(document.getElementById("root")!).render(<App />);

mountAfriChatWidget();
