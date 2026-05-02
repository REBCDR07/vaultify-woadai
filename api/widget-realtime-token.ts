import { assertSiteKey, corsHeaders, getEnv, jsonResponse } from "./_shared/proxy";

export const maxDuration = 30;

export async function OPTIONS() {
  return new Response("ok", { headers: corsHeaders });
}

export async function POST(request: Request): Promise<Response> {
  const siteKeyError = assertSiteKey(request);
  if (siteKeyError) return siteKeyError;

  const token = getEnv("AFRICHAT_REALTIME_TOKEN", "VITE_AFRICHAT_REALTIME_TOKEN");
  if (!token) {
    return jsonResponse({ error: "Realtime token not configured." }, 501);
  }

  return jsonResponse({ token });
}
