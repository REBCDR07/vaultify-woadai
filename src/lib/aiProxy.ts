// Client wrapper for the LewisNote AI proxy edge function.
// Falls back to user's BYOK key if provided, otherwise server keys are used.

import { supabase } from "@/integrations/supabase/client";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  reasoning_effort?: "none" | "low" | "medium" | "high";
  web_search?: boolean;
  userKey?: string; // optional, BYOK
}

export interface AIResponse {
  content: string;
  tokens: number;
  raw: any;
}

export async function callAI(req: AIRequest): Promise<AIResponse> {
  const { data, error } = await supabase.functions.invoke("ai-proxy", {
    body: req,
  });

  if (error) throw new Error(error.message || "AI proxy error");
  if (data?.error) throw new Error(data.error);

  const content = data?.choices?.[0]?.message?.content || "";
  const tokens = data?.usage?.total_tokens || 0;
  return { content, tokens, raw: data };
}

// Try to parse JSON robustly (the model may wrap it in code fences).
export function safeParseJSON<T = any>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  try {
    return JSON.parse(text);
  } catch {
    // try to extract first {...} or [...]
    const m = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}
