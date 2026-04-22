import { createMyAfriChat } from "my-africhat";
import afriChatConfig from "@/africhat.config.js";

const PLACEHOLDER_SITE_KEY = "afc_live_xxxxxxxxxxxx.yyyyyyyyyyyyyyyy";
const CONTEXT_MARKER = "[Vaultify Widget Context v1]";

let mounted = false;
let fetchPatched = false;

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => asText(entry)).filter(Boolean);
}

function formatWorkflow(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";

      const step = asText((entry as { step?: unknown }).step);
      const title = asText((entry as { title?: unknown }).title);
      const detail = asText((entry as { detail?: unknown }).detail);

      const label = [step, title].filter(Boolean).join(" ").trim();
      return [label, detail].filter(Boolean).join(": ");
    })
    .filter(Boolean);
}

function normalizeEndpoint(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed, window.location.origin).toString();
  } catch {
    return trimmed;
  }
}

function buildWidgetContextMessage(config: any): string {
  const kb = config?.knowledgeBase || {};
  const creator = kb?.creatorProfile || {};
  const ai = kb?.aiIntegration || {};

  const lines: string[] = [
    CONTEXT_MARKER,
    "Official Vaultify context. Use this as source of truth for product questions.",
  ];

  const creatorName = asText(creator?.name);
  const creatorRole = asText(creator?.role);
  const creatorMission = asText(creator?.mission);

  if (creatorName || creatorRole) {
    lines.push(`Creator: ${creatorName}${creatorRole ? ` (${creatorRole})` : ""}.`);
  }
  if (creatorMission) {
    lines.push(`Creator mission: ${creatorMission}`);
  }

  const homeSummary = asText(kb?.homeSummary);
  if (homeSummary) {
    lines.push(`Product summary: ${homeSummary}`);
  }

  const features = asStringList(kb?.featureHighlights);
  if (features.length > 0) {
    lines.push("Key features:");
    lines.push(...features.map((item) => `- ${item}`));
  }

  const models = asStringList(ai?.models);
  if (models.length > 0) {
    lines.push(`Available AI models: ${models.join(", ")}.`);
  }

  const workflow = formatWorkflow(kb?.workflow);
  if (workflow.length > 0) {
    lines.push("How Vaultify works:");
    lines.push(...workflow.map((item) => `- ${item}`));
  }

  const limits = asStringList(kb?.trustAndLimits);
  if (limits.length > 0) {
    lines.push("Trust and limits:");
    lines.push(...limits.map((item) => `- ${item}`));
  }

  const rules = asStringList(kb?.businessRules);
  if (rules.length > 0) {
    lines.push("Assistant rules:");
    lines.push(...rules.map((item) => `- ${item}`));
  }

  return lines.join("\n");
}

function patchAfriChatRequestContext(config: any) {
  if (fetchPatched || typeof window === "undefined") return;

  const chatEndpoint = normalizeEndpoint(asText(config?.api?.chatEndpoint));
  if (!chatEndpoint) return;

  const expectedSiteKey = asText(config?.api?.siteKey);
  const contextMessage = buildWidgetContextMessage(config);
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (normalizeEndpoint(requestUrl) !== chatEndpoint) {
        return originalFetch(input, init);
      }

      if (!init || typeof init.body !== "string") {
        return originalFetch(input, init);
      }

      const headers = new Headers(init.headers || {});
      const currentSiteKey = asText(headers.get("x-site-key"));
      if (expectedSiteKey && currentSiteKey && expectedSiteKey !== currentSiteKey) {
        return originalFetch(input, init);
      }

      const payload = JSON.parse(init.body);
      if (!payload || !Array.isArray(payload.messages)) {
        return originalFetch(input, init);
      }

      const alreadyInjected = payload.messages.some(
        (entry: { role?: string; content?: string }) =>
          entry?.role === "assistant" && typeof entry?.content === "string" && entry.content.includes(CONTEXT_MARKER)
      );

      if (alreadyInjected) {
        return originalFetch(input, init);
      }

      const patchedPayload = {
        ...payload,
        messages: [
          {
            role: "assistant",
            content: contextMessage,
          },
          ...payload.messages,
        ],
      };

      return originalFetch(input, {
        ...init,
        body: JSON.stringify(patchedPayload),
      });
    } catch {
      return originalFetch(input, init);
    }
  };

  fetchPatched = true;
}

export function mountAfriChatWidget() {
  if (mounted || typeof window === "undefined") return;

  const config = afriChatConfig;
  const siteKey = (config?.api?.siteKey || "").trim();

  if (!siteKey || siteKey === PLACEHOLDER_SITE_KEY) {
    console.info("[AfriChat] Widget non monte: VITE_AFRICHAT_SITE_KEY non configuree.");
    return;
  }

  try {
    patchAfriChatRequestContext(config);
    createMyAfriChat(config).mount();
    mounted = true;
  } catch (error) {
    console.error("[AfriChat] Erreur de montage:", error);
  }
}
