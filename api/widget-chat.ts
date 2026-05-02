import { assertSiteKey, corsHeaders, getEnv, jsonResponse, proxyJsonRequest } from "./_shared/proxy";

export const maxDuration = 300;

const SUPPORTED_MODELS = new Set(["gpt-5.4-pro", "gpt-5.4-mini", "gpt-5.3-codex"]);

function resolveModel(raw: string | undefined): string {
  const candidate = (raw || "").trim();
  return candidate && SUPPORTED_MODELS.has(candidate) ? candidate : "gpt-5.4-pro";
}

interface WidgetChatRequest {
  messages: Array<{ role: string; content: unknown }>;
  stream?: boolean;
  audio?: {
    enabled?: boolean;
    voice?: string;
  };
}

const DEFAULT_MODEL = resolveModel(getEnv("AFRICHAT_MODEL", "VITE_AFRICHAT_MODEL"));
const DEFAULT_REASONING = (getEnv("AFRICHAT_REASONING_EFFORT", "VITE_AFRICHAT_REASONING_EFFORT") || "medium").trim() as
  | "none"
  | "low"
  | "medium"
  | "high";

function buildSystemPrompt(): string {
  const custom = getEnv("AFRICHAT_SYSTEM_PROMPT", "VITE_AFRICHAT_SYSTEM_PROMPT");
  if (custom) return custom;

  return [
    "Tu es l'assistant de Vaultify.",
    "Reponds en francais par defaut, et en anglais si l'utilisateur ecrit en anglais.",
    "Concentre-toi uniquement sur les fonctionnalites reelles de Vaultify: recherche GitHub augmentee, scoring des repositories, analyse detaillee d'un repo, analyse de profils developpeurs, exploration des developpeurs beninois, favoris, collections, export, et illustrations GPT Image 2.",
    "N'invente pas de fonctionnalites, de providers ou de secrets.",
    "Reponds en texte clair, sans markdown decoratif inutile, sans balises, et sans asterisques superflus.",
    "Si l'utilisateur demande les modeles, cite seulement: gpt-5.4-pro, gpt-5.4-mini, gpt-5.3-codex, gpt-image-2.",
    "Si l'utilisateur pose une question generale, donne des reponses concretes et actionnables.",
  ].join(" ");
}

export async function OPTIONS() {
  return new Response("ok", { headers: corsHeaders });
}

export async function POST(request: Request): Promise<Response> {
  const siteKeyError = assertSiteKey(request);
  if (siteKeyError) return siteKeyError;

  try {
    const body = (await request.json()) as WidgetChatRequest;
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse({ error: "messages requis" }, 400);
    }

    const messages = [{ role: "system", content: buildSystemPrompt() }, ...body.messages];
    const payload: Record<string, unknown> = {
      model: DEFAULT_MODEL,
      messages,
      stream: body.stream ?? true,
      reasoning_effort: DEFAULT_REASONING,
    };

    const forwardAudio = ((getEnv("AFRICHAT_FORWARD_AUDIO", "VITE_AFRICHAT_FORWARD_AUDIO") || "").trim().toLowerCase() === "true");
    if (forwardAudio && body.audio?.enabled) {
      payload.audio = {
        enabled: true,
        voice:
          body.audio.voice ||
          getEnv("AFRICHAT_TTS_VOICE", "VITE_AFRICHAT_TTS_VOICE", "AI_TTS_VOICE", "VITE_AI_TTS_VOICE") ||
          "alloy",
      };
    }

    return await proxyJsonRequest("/chat/completions", payload, { stream: body.stream ?? true });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
