import { assertSiteKey, corsHeaders, jsonResponse } from "./_shared/proxy";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const siteKeyError = assertSiteKey(request);
  if (siteKeyError) return siteKeyError;

  const token = (process.env.AFRICHAT_REALTIME_TOKEN || "").trim();
  if (!token) {
    return jsonResponse({ error: "Realtime token not configured." }, 501);
  }

  return jsonResponse({ token });
}
