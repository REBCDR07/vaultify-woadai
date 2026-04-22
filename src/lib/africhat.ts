import { createMyAfriChat } from "my-africhat";
import afriChatConfig from "@/africhat.config.js";

const PLACEHOLDER_SITE_KEY = "afc_live_xxxxxxxxxxxx.yyyyyyyyyyyyyyyy";

let mounted = false;

export function mountAfriChatWidget() {
  if (mounted || typeof window === "undefined") return;

  const config = afriChatConfig;
  const siteKey = (config?.api?.siteKey || "").trim();

  if (!siteKey || siteKey === PLACEHOLDER_SITE_KEY) {
    console.info("[AfriChat] Widget non monte: VITE_AFRICHAT_SITE_KEY non configuree.");
    return;
  }

  try {
    createMyAfriChat(config).mount();
    mounted = true;
  } catch (error) {
    console.error("[AfriChat] Erreur de montage:", error);
  }
}
