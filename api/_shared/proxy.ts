export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-site-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(payload: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export function rawResponse(body: BodyInit | null, status = 200, contentType = "text/plain", extraHeaders: HeadersInit = {}): Response {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": contentType,
      ...extraHeaders,
    },
  });
}

export function getEnv(name: string): string {
  return (process.env[name] || "").trim();
}

export function getBaseUrl(name = "AI_BASE_URL"): string {
  return getEnv(name).replace(/\/+$/, "");
}

export function getServerKeys(prefix = "AI_API_KEY_"): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const value = getEnv(`${prefix}${i}`);
    if (value) keys.push(value);
  }
  return keys;
}

export function assertSiteKey(request: Request, envName = "AFRICHAT_SITE_KEY"): Response | null {
  const expected = getEnv(envName);
  if (!expected) return null;

  const received = (request.headers.get("x-site-key") || "").trim();
  if (!received || received !== expected) {
    return jsonResponse({ error: "Invalid site key." }, 403);
  }

  return null;
}

export async function proxyJsonRequest(
  path: string,
  payload: Record<string, unknown>,
  options: {
    baseUrl?: string;
    keyPrefix?: string;
    stream?: boolean;
  } = {}
): Promise<Response> {
  const baseUrl = (options.baseUrl || getBaseUrl()).trim();
  const keyCandidates = getServerKeys(options.keyPrefix || "AI_API_KEY_");

  if (!baseUrl) {
    return jsonResponse({ error: "AI base URL is not configured." }, 500);
  }

  if (keyCandidates.length === 0) {
    return jsonResponse({ error: "No AI keys are configured." }, 500);
  }

  let lastStatus = 500;
  let lastDetail = "";

  for (const key of keyCandidates) {
    const upstream = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (upstream.ok) {
      if (options.stream) {
        if (!upstream.body) {
          return jsonResponse({ error: "Streaming response missing." }, 502);
        }

        return rawResponse(upstream.body, upstream.status, "text/event-stream; charset=utf-8", {
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        });
      }

      const text = await upstream.text();
      const contentType = upstream.headers.get("content-type") || "application/json";
      return rawResponse(text, upstream.status, contentType.includes("application/json") ? "application/json" : contentType);
    }

    lastStatus = upstream.status;
    lastDetail = await upstream.text();
  }

  return jsonResponse(
    {
      error: "All configured AI keys failed.",
      status: lastStatus,
      detail: lastDetail,
    },
    502
  );
}
