import { assertSiteKey, corsHeaders, jsonResponse, getBaseUrl, getServerKeys, rawResponse } from "../_shared/proxy.ts";

interface TtsRequest {
  input: string;
  voice?: string;
  response_format?: string;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const siteKeyError = assertSiteKey(request);
  if (siteKeyError) return siteKeyError;

  try {
    const body = (await request.json()) as TtsRequest;
    const input = (body.input || "").trim();
    if (!input) {
      return jsonResponse({ error: "input requis" }, 400);
    }

    const baseUrl = getBaseUrl("AI_TTS_BASE_URL") || getBaseUrl();
    const model = (Deno.env.get("AFRICHAT_TTS_MODEL") || Deno.env.get("AI_TTS_MODEL") || "gpt-4o-mini-tts").trim();
    const keyCandidates = getServerKeys("AI_TTS_API_KEY_").length > 0 ? getServerKeys("AI_TTS_API_KEY_") : getServerKeys();

    if (!baseUrl) {
      return jsonResponse({ error: "TTS base URL is not configured." }, 500);
    }

    if (keyCandidates.length === 0) {
      return jsonResponse({ error: "No TTS keys are configured." }, 500);
    }

    let lastStatus = 500;
    let lastDetail = "";

    for (const key of keyCandidates) {
      const upstream = await fetch(`${baseUrl}/audio/speech`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input,
          voice: body.voice || Deno.env.get("AFRICHAT_TTS_VOICE") || "nova",
          response_format: body.response_format || "mp3",
        }),
      });

      if (upstream.ok) {
        const blob = await upstream.blob();
        return rawResponse(blob, upstream.status, upstream.headers.get("content-type") || "audio/mpeg");
      }

      lastStatus = upstream.status;
      lastDetail = await upstream.text();
      if (![401, 402, 403, 429].includes(upstream.status)) {
        return rawResponse(lastDetail, upstream.status, upstream.headers.get("content-type") || "text/plain");
      }
    }

    return jsonResponse({ error: "All configured TTS keys failed.", status: lastStatus, detail: lastDetail }, 502);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
