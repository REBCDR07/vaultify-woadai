import { assertSiteKey, corsHeaders, jsonResponse } from "../_shared/proxy.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const siteKeyError = assertSiteKey(request);
  if (siteKeyError) return siteKeyError;

  const token = (Deno.env.get("AFRICHAT_REALTIME_TOKEN") || "").trim();
  if (!token) {
    return jsonResponse({ error: "Realtime token not configured." }, 501);
  }

  return jsonResponse({ token });
});
