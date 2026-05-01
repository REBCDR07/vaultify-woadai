// LewisNote AI proxy with automatic key rotation & fallback
// Public endpoint (no JWT required) — keys never reach the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LEWIS_BASE = "https://build.lewisnote.com/v1";

function getServerKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const v = Deno.env.get(`LEWISNOTE_API_KEY_${i}`);
    if (v && v.trim()) keys.push(v.trim());
  }
  return keys;
}

interface ProxyRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  reasoning_effort?: "none" | "low" | "medium" | "high";
  web_search?: boolean;
  stream?: boolean;
  response_format?: unknown;
  userKey?: string; // optional client-supplied LewisNote key (BYOK)
}

async function callLewis(apiKey: string, payload: Record<string, unknown>) {
  return await fetch(`${LEWIS_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as ProxyRequest;
    const {
      model,
      messages,
      temperature = 0.5,
      max_tokens = 4096,
      reasoning_effort,
      web_search,
      stream = false,
      response_format,
      userKey,
    } = body;

    if (!model || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "model + messages requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    // Build key candidates: user key first (if provided), then server keys.
    const candidates: string[] = [];
    if (userKey && userKey.trim()) candidates.push(userKey.trim());
    candidates.push(...getServerKeys());

    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucune clé LewisNote disponible côté serveur." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let lastStatus = 500;
    let lastErrorText = "";

    for (let i = 0; i < candidates.length; i++) {
      const key = candidates[i];
      try {
        const upstream = await callLewis(key, payload);

        if (upstream.ok) {
          // Streaming passthrough
          if (stream && upstream.body) {
            return new Response(upstream.body, {
              headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
            });
          }
          const data = await upstream.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        lastStatus = upstream.status;
        lastErrorText = await upstream.text();
        // Fallback only for auth/rate/credit errors
        if (![401, 402, 403, 429].includes(upstream.status)) {
          return new Response(
            JSON.stringify({ error: "LewisNote error", status: upstream.status, detail: lastErrorText }),
            { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        console.warn(`[ai-proxy] key #${i} failed (${upstream.status}), trying next...`);
      } catch (e) {
        lastErrorText = String(e);
        console.error(`[ai-proxy] key #${i} threw`, e);
      }
    }

    return new Response(
      JSON.stringify({
        error: "Toutes les clés LewisNote ont échoué",
        status: lastStatus,
        detail: lastErrorText,
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[ai-proxy] fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
