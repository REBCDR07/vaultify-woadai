import { assertSiteKey, corsHeaders, jsonResponse, proxyJsonRequest } from "../_shared/proxy.ts";

interface WidgetChatRequest {
  messages: Array<{ role: string; content: unknown }>;
  stream?: boolean;
}

const DEFAULT_MODEL = (Deno.env.get("AFRICHAT_MODEL") || "gpt-5.4-mini").trim() || "gpt-5.4-mini";
const DEFAULT_REASONING = (Deno.env.get("AFRICHAT_REASONING_EFFORT") || "medium").trim() as "none" | "low" | "medium" | "high";

function buildSystemPrompt(): string {
  const custom = (Deno.env.get("AFRICHAT_SYSTEM_PROMPT") || "").trim();
  if (custom) return custom;

  return [
    "Tu es l'assistant de Vaultify.",
    "Reponds en francais par defaut, et en anglais si l'utilisateur ecrit en anglais.",
    "Concentre-toi uniquement sur les fonctionnalites reelles de Vaultify: recherche GitHub augmentee, scoring des repositories, analyse detaillee d'un repo, analyse de profils developpeurs, exploration des developpeurs beninois, favoris, collections, export, et illustrations GPT Image 2.",
    "N'invente pas de fonctionnalites, de providers ou de secrets.",
    "Si l'utilisateur demande les modeles, cite seulement: gpt-5.5, gpt-5.4-mini, gpt-5.4, gpt-image-2.",
    "Si l'utilisateur pose une question generale, donne des reponses concretes et actionnables.",
  ].join(" ");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const siteKeyError = assertSiteKey(request);
  if (siteKeyError) return siteKeyError;

  try {
    const body = (await request.json()) as WidgetChatRequest;
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse({ error: "messages requis" }, 400);
    }

    const messages = [
      { role: "system", content: buildSystemPrompt() },
      ...body.messages,
    ];

    return await proxyJsonRequest(
      "/chat/completions",
      {
        model: DEFAULT_MODEL,
        messages,
        stream: body.stream ?? true,
        reasoning_effort: DEFAULT_REASONING,
      },
      { stream: body.stream ?? true }
    );
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
