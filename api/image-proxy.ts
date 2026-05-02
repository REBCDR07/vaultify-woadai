import { corsHeaders, jsonResponse, proxyJsonRequest } from "./_shared/proxy";

export const maxDuration = 300;

interface ImageRequest {
  model: string;
  prompt: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  quality?: "low" | "medium" | "high";
  n?: number;
  background?: "auto" | "transparent" | "opaque";
  output_format?: "png" | "jpg" | "webp";
}

async function handle(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as ImageRequest;
    const { model, prompt, size = "1024x1024", quality = "medium", n = 1, background = "auto", output_format = "png" } = body;

    if (!model || !prompt) {
      return jsonResponse({ error: "model + prompt requis" }, 400);
    }

    return await proxyJsonRequest(
      "/images/generations",
      {
        model,
        prompt,
        size,
        quality,
        n,
        background,
        output_format,
      },
      { signal: request.signal }
    );
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export default { fetch: handle };
