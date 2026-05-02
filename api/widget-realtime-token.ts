import { assertSiteKey, corsHeaders, getEnv, jsonResponse } from "./_shared/proxy";

export const maxDuration = 30;

async function handle(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const siteKeyError = assertSiteKey(request);
  if (siteKeyError) return siteKeyError;

  const token = getEnv("AFRICHAT_REALTIME_TOKEN", "VITE_AFRICHAT_REALTIME_TOKEN");
  if (!token) {
    return jsonResponse({ error: "Realtime token not configured." }, 501);
  }

  return jsonResponse({ token });
}

export default { fetch: handle };
