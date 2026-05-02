import { corsHeaders, jsonResponse, proxyJsonRequest } from "../_shared/proxy.ts";

interface ProxyRequest {
  model: string;
  messages: Array<{ role: string; content: unknown }>;
  temperature?: number;
  max_tokens?: number;
  reasoning_effort?: "none" | "low" | "medium" | "high";
  web_search?: boolean;
  stream?: boolean;
  response_format?: unknown;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as ProxyRequest;
    const { model, messages, temperature = 0.5, max_tokens = 4096, reasoning_effort, web_search, stream = false, response_format } = body;

    if (!model || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: "model + messages requis" }, 400);
    }

    const payload: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens,
      stream,
    };

    if (reasoning_effort) payload.reasoning_effort = reasoning_effort;
    if (web_search) payload.web_search = true;
    if (response_format) payload.response_format = response_format;

    return await proxyJsonRequest("/chat/completions", payload);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
