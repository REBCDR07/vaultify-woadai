import { createMyAfriChat } from "my-africhat";
import afriChatConfig from "@/africhat.config.js";

const PLACEHOLDER_SITE_KEY = "afc_live_xxxxxxxxxxxx.yyyyyyyyyyyyyyyy";

let mounted = false;

export function mountAfriChatWidget() {
  if (mounted || typeof window === "undefined") return;

  const siteKey = typeof afriChatConfig?.api?.siteKey === "string" ? afriChatConfig.api.siteKey.trim() : "";
  const chatEndpoint = typeof afriChatConfig?.api?.chatEndpoint === "string" ? afriChatConfig.api.chatEndpoint.trim() : "";

  if (!siteKey || siteKey === PLACEHOLDER_SITE_KEY || !chatEndpoint) {
    console.info("[AfriChat] Widget non monte: configuration manquante.");
    return;
  }

  try {
    createMyAfriChat(afriChatConfig).mount();
    mounted = true;
  } catch (error) {
    console.error("[AfriChat] Erreur de montage:", error);
  }
}
