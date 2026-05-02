// AI client routed through deploy-time proxy endpoints.

import { IMAGE_MODEL, IMAGE_PROMPT_MODEL } from "@/lib/constants";
const normalizeUrl = (value: string) => (value || "").trim().replace(/\/+$/, "");
const apiBaseUrl = normalizeUrl(import.meta.env.VITE_AFRICHAT_API_BASE_URL || "");
const chatEndpoint = normalizeUrl(import.meta.env.VITE_AI_CHAT_ENDPOINT || "") || (apiBaseUrl ? `${apiBaseUrl}/ai-proxy` : "/api/ai-proxy");
const imageEndpoint = normalizeUrl(import.meta.env.VITE_AI_IMAGE_ENDPOINT || "") || (apiBaseUrl ? `${apiBaseUrl}/image-proxy` : "/api/image-proxy");

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  reasoningEffort?: "none" | "low" | "medium" | "high";
  webSearch?: boolean;
}

interface ImageOptions {
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  quality?: "low" | "medium" | "high";
  background?: "auto" | "transparent" | "opaque";
  outputFormat?: "png" | "jpg" | "webp";
  layout?: "square" | "portrait" | "landscape";
}

export interface RepoIllustrationPlan {
  title: string;
  style: string;
  imageCount: number;
  characterDescription?: string;
  prompts: string[];
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    total_tokens?: number;
  };
}

interface ScoredRepoResult {
  full_name: string;
  score: number;
  summary: string;
  useCases: string;
  strengths: string;
}

interface RepoDetailAnalysis {
  description: string;
  useCases: string;
  compatibleStack: string;
  strengths: string;
  similar: string[];
}

interface DevProfileAnalysis {
  summary: string;
  expertise: string;
  collaborationFit: string;
  projectSuggestions: string;
  ranking: string;
}

function getEndpointCandidates(kind: "chat" | "image"): string[] {
  const endpoint = kind === "chat" ? chatEndpoint : imageEndpoint;
  return endpoint ? [endpoint] : [];
}

function extractTextValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractImageUrl(entry: unknown, outputFormat: string): string {
  if (!isRecord(entry)) return "";

  const directUrl = extractTextValue(entry.url);
  if (directUrl) return directUrl;

  const b64 = extractTextValue(entry.b64_json);
  if (!b64) return "";

  const mime = outputFormat === "jpg" ? "jpeg" : outputFormat;
  return `data:image/${mime};base64,${b64}`;
}

function getProxyHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

export function safeParseJSON<T = unknown>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      try {
        return JSON.parse(match[1]) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

async function postChatCompletion(endpoint: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers: getProxyHeaders(),
    body: JSON.stringify(payload),
  });
}

async function postImageGeneration(endpoint: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers: getProxyHeaders(),
    body: JSON.stringify(payload),
  });
}

async function callWithFallback<T>(
  endpoints: string[],
  executor: (endpoint: string) => Promise<Response>,
  onSuccess: (response: Response) => Promise<T>
): Promise<T> {
  if (endpoints.length === 0) {
    throw new Error("Missing proxy configuration.");
  }

  let lastError: string | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await executor(endpoint);
      if (res.ok) {
        return onSuccess(res);
      }

      const detail = await res.text();
      lastError = `Proxy error (${res.status}): ${detail}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(lastError || "Proxy error: all configured attempts failed.");
}

export function isAiConfigured(_overrideKey?: string): boolean {
  return getEndpointCandidates("chat").length > 0;
}

export async function callAi(
  apiKey: string | undefined,
  model: string,
  messages: AIMessage[],
  options: ChatOptions = {}
): Promise<{ content: string; tokens: number }> {
  return callWithFallback(
    getEndpointCandidates("chat"),
    (endpoint) =>
      postChatCompletion(endpoint, {
        model,
        messages,
        stream: false,
        reasoning_effort: options.reasoningEffort ?? "medium",
        web_search: options.webSearch ?? false,
      }),
    async (res) => {
      const data = (await res.json()) as ChatCompletionResponse;
      return {
        content: data.choices?.[0]?.message?.content || "",
        tokens: data.usage?.total_tokens || 0,
      };
    }
  );
}
export async function reformulateQuery(
  apiKey: string | undefined,
  model: string,
  query: string
): Promise<{ queries: string[]; tokens: number }> {
  const { content, tokens } = await callAi(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Tu es un expert en recherche GitHub.
L'utilisateur décrit un besoin en langage naturel.
Genere exactement 5 requetes GitHub Search API optimisées pour couvrir des angles differents.
Reponds UNIQUEMENT avec un JSON array de 5 strings.`,
      },
      { role: "user", content: query },
    ],
    { reasoningEffort: "low", webSearch: true }
  );

  const parsed = safeParseJSON<string[]>(content, [query]);
  return {
    queries: Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, 5) : [query],
    tokens,
  };
}

export async function scoreAndSummarize(
  apiKey: string | undefined,
  model: string,
  originalQuery: string,
  repos: Array<{
    full_name: string;
    description: string;
    stargazers_count: number;
    language: string;
    topics: string[];
    updated_at: string;
    license?: { spdx_id: string };
  }>
): Promise<{
  results: Array<{ full_name: string; score: number; summary: string; useCases: string; strengths: string }>;
  tokens: number;
}> {
  const repoList = repos.map((r) => ({
    name: r.full_name,
    desc: r.description,
    stars: r.stargazers_count,
    lang: r.language,
    topics: r.topics,
    updated: r.updated_at,
    license: r.license?.spdx_id,
  }));

  const { content, tokens } = await callAi(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Tu es un expert senior en evaluation de repositories GitHub.
Retourne UNIQUEMENT un JSON array trie par pertinence décroissante (max 15).
Schema de chaque element:
{
  "full_name": string,
  "score": number (0-100),
  "summary": string (3-4 phrases utiles, pas de markdown),
  "useCases": string,
  "strengths": string
}`,
      },
      {
        role: "user",
        content: `Requete: "${originalQuery}"\n\nRepos:\n${JSON.stringify(repoList)}`,
      },
    ],
    { reasoningEffort: "medium", webSearch: false }
  );

  const parsed = safeParseJSON<ScoredRepoResult[]>(content, []);
  return { results: Array.isArray(parsed) ? parsed : [], tokens };
}

export async function generateSuggestions(
  apiKey: string | undefined,
  model: string,
  originalQuery: string
): Promise<{ suggestions: string[]; tokens: number }> {
  const { content, tokens } = await callAi(
    apiKey,
    model,
    [
      {
        role: "system",
        content: "Genere 4 recherches connexes pertinentes basées sur la requete. Reponds UNIQUEMENT avec un JSON array de 4 strings courts.",
      },
      { role: "user", content: originalQuery },
    ],
    { reasoningEffort: "low", webSearch: true }
  );

  const parsed = safeParseJSON<string[]>(content, []);
  return { suggestions: Array.isArray(parsed) ? parsed : [], tokens };
}

export async function analyzeDevProfile(
  apiKey: string | undefined,
  model: string,
  user: {
    login: string;
    name: string | null;
    bio: string | null;
    location: string | null;
    followers: number;
    following: number;
    public_repos: number;
    company: string | null;
  },
  repos: Array<{
    name: string;
    description: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    topics: string[];
  }>
): Promise<{
  profile: { summary: string; expertise: string; collaborationFit: string; projectSuggestions: string; ranking: string };
  tokens: number;
}> {
  const repoSummary = repos.map((r) => ({
    name: r.name,
    desc: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    lang: r.language,
    topics: r.topics,
  }));

  const { content, tokens } = await callAi(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Analyse ce profil developpeur GitHub et retourne UNIQUEMENT un JSON:
{
  "summary": string,
  "expertise": string,
  "collaborationFit": string,
  "projectSuggestions": string,
  "ranking": string
}`,
      },
      {
        role: "user",
        content: `Profil: ${user.name || user.login}\nBio: ${user.bio || "N/A"}\nLocation: ${user.location || "N/A"}\nCompany: ${user.company || "N/A"}\nFollowers: ${user.followers}\nRepos publics: ${user.public_repos}\n\nTop repos:\n${JSON.stringify(repoSummary)}`,
      },
    ],
    { reasoningEffort: "high", webSearch: false }
  );

  const profile = safeParseJSON<DevProfileAnalysis>(content, {
    summary: "",
    expertise: "",
    collaborationFit: "",
    projectSuggestions: "",
    ranking: "",
  });

  return { profile, tokens };
}

export async function generateRepoDetail(
  apiKey: string | undefined,
  model: string,
  repoData: { full_name: string; description: string; readme?: string }
): Promise<{
  detail: {
    description: string;
    useCases: string;
    compatibleStack: string;
    strengths: string;
    similar: string[];
  };
  tokens: number;
}> {
  const { content, tokens } = await callAi(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Analyse ce repository GitHub en detail. Retourne UNIQUEMENT un JSON avec description, useCases, compatibleStack, strengths et similar.`,
      },
      {
        role: "user",
        content: `Repo: ${repoData.full_name}\nDescription: ${repoData.description}\nREADME (extrait): ${(repoData.readme || "").slice(0, 8000)}`,
      },
    ],
    { reasoningEffort: "medium", webSearch: true }
  );

  const detail = safeParseJSON<RepoDetailAnalysis>(content, {
    description: repoData.description || "",
    useCases: "",
    compatibleStack: "",
    strengths: "",
    similar: [] as string[],
  });

  return { detail, tokens };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function estimateIllustrationCount(
  repoData: { full_name: string; description: string; topics?: string[]; stargazers_count?: number; forks_count?: number },
  readme: string,
  aiDetail?: { compatibleStack?: string; strengths?: string; useCases?: string }
): number {
  const detailText = [aiDetail?.compatibleStack, aiDetail?.strengths, aiDetail?.useCases].filter(Boolean).join(" ").toLowerCase();
  let score = 3;

  if (readme.length > 1200) score += 2;
  else if (readme.length > 600) score += 1;

  if ((repoData.topics || []).length >= 4) score += 1;
  if ((repoData.stargazers_count || 0) >= 1000) score += 1;
  if ((repoData.forks_count || 0) >= 200) score += 1;
  if (detailText.length > 120) score += 1;
  if (/framework|platform|engine|compiler|sdk|cli|orchestration|workflow|pipeline|infrastructure|database|ml|ai|visualization/.test(detailText)) {
    score += 1;
  }

  return clamp(score, 3, 10);
}
function buildFallbackIllustrationPrompts(
  repoData: { full_name: string; description: string; topics?: string[] },
  aiDetail: { description?: string; useCases?: string; compatibleStack?: string; strengths?: string },
  count: number,
  layout: "square" | "portrait" | "landscape",
  characterDescription?: string
): string[] {
  const focus = [aiDetail.description, aiDetail.useCases, aiDetail.compatibleStack, aiDetail.strengths]
    .filter(Boolean)
    .join(" ");
  const repoName = repoData.full_name;
  const desc = repoData.description || focus || repoName;
  const layoutText =
    layout === "landscape"
      ? "Horizontal landscape cinematic composition, wide framing, strong depth layers"
      : layout === "square"
        ? "Square cinematic composition, balanced framing, central focus"
        : "Vertical portrait cinematic composition, elegant tall framing";
  const characterText =
    characterDescription ||
    `Consistent 3D hero character or symbolic mascot inspired by ${repoName}, polished surfaces, premium lighting, expressive but minimal`; 

  const scenes = [
    `${layoutText}, ultra-detailed 8k cinematic illustration of ${repoName}, showing the core architecture and identity of the project, clean glowing interface motifs, dark premium background, no text, no watermark, no logo, realistic lighting, high clarity, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of the developer workflow and data flow inside ${repoName}, layered systems, connected modules, elegant technical diagrams as visual metaphors, no text, no watermark, no logo, premium contrast, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of the key user experience enabled by ${repoName}, people interacting with a sophisticated product interface, polished modern composition, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of the most technical component of ${repoName}, infrastructure, APIs, orchestration and advanced engineering atmosphere, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of the ecosystem around ${repoName}, integrations, connected tools, data streams and collaborative engineering environment, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of the future vision of ${repoName}, scalable architecture, strategic product depth, dramatic lighting, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of code and product abstractions from ${repoName}, elegant layers, refined UI and engineering motifs, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of the operational impact of ${repoName}, speed, clarity and productivity represented through a premium technical scene, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of a symbolic hero image for ${repoName}, modern tech aesthetic, cinematic depth, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
    `${layoutText}, ultra-detailed 8k cinematic illustration of a final dramatic scene representing ${repoName}, complex but elegant architecture, premium editorial style, no text, no watermark, no logo, ${characterText}, inspired by: ${desc}`,
  ];

  return scenes.slice(0, clamp(count, 3, 10));
}

export async function generateRepoIllustrationPlan(
  apiKey: string | undefined,
  repoData: {
    full_name: string;
    description: string;
    readme?: string;
    topics?: string[];
    stargazers_count?: number;
    forks_count?: number;
  },
  aiDetail?: { description?: string; useCases?: string; compatibleStack?: string; strengths?: string },
  options: { maxImages?: number; layout?: "square" | "portrait" | "landscape" } = {}
): Promise<{ plan: RepoIllustrationPlan; tokens: number }> {
  const layout = options.layout || "landscape";
  const maxImages = clamp(options.maxImages || 10, 3, 10);
  const desiredCount = clamp(estimateIllustrationCount(repoData, repoData.readme || "", aiDetail), 3, maxImages);

  const { content, tokens } = await callAi(
    apiKey,
    IMAGE_PROMPT_MODEL,
    [
      {
        role: "system",
        content: `Tu es prompt engineer pour GPT Image 2. Reponds uniquement en JSON strict. Genere ${desiredCount} prompts distincts, coherents, en anglais, sans texte ni logo. Le style doit etre ${layout === "landscape" ? "horizontal landscape" : layout === "square" ? "square" : "portrait vertical"}, 8K ultra cinematique. Schema: { "title": string, "style": string, "characterDescription": string, "imageCount": number, "prompts": string[] }`,
      },
      {
        role: "user",
        content: `Repo: ${repoData.full_name}
Description: ${repoData.description}
README: ${(repoData.readme || "").slice(0, 3500)}
Analysis: ${JSON.stringify(aiDetail || {})}
Target image count: ${desiredCount}
Layout: ${layout}`,
      },
    ],
    { reasoningEffort: "low", webSearch: false }
  );

  const fallbackPrompts = buildFallbackIllustrationPrompts(repoData, aiDetail || {}, desiredCount, layout);
  const parsed = safeParseJSON<RepoIllustrationPlan>(content, {
    title: repoData.full_name,
    style: `${layout} 8k ultra cinematic`,
    imageCount: desiredCount,
    characterDescription: `Consistent 3D hero character inspired by ${repoData.full_name}`,
    prompts: fallbackPrompts,
  });

  const prompts = Array.isArray(parsed.prompts) && parsed.prompts.length > 0 ? parsed.prompts : fallbackPrompts;
  const imageCount = clamp(Number.isFinite(parsed.imageCount) ? Number(parsed.imageCount) : prompts.length, 3, maxImages);

  return {
    plan: {
      title: parsed.title || repoData.full_name,
      style: parsed.style || `${layout} 8k ultra cinematic`,
      imageCount,
      characterDescription: parsed.characterDescription || `Consistent 3D hero character inspired by ${repoData.full_name}`,
      prompts: prompts.slice(0, imageCount),
    },
    tokens,
  };
}

function layoutToSize(layout: "square" | "portrait" | "landscape", size?: ImageOptions["size"]): ImageOptions["size"] {
  if (size) return size;
  if (layout === "portrait") return "1024x1536";
  if (layout === "square") return "1024x1024";
  return "1536x1024";
}

export async function generateRepoIllustration(
  apiKey: string | undefined,
  prompt: string,
  options: ImageOptions = {}
): Promise<string> {
  const outputFormat = options.outputFormat || "png";
  const layout = options.layout || "landscape";

  return callWithFallback(
    getEndpointCandidates("image"),
    (endpoint) =>
      postImageGeneration(endpoint, {
        model: IMAGE_MODEL,
        prompt,
        size: layoutToSize(layout, options.size),
        quality: options.quality || "high",
        n: 1,
        background: options.background || "auto",
        output_format: outputFormat,
      }),
    async (res) => {
      const data = await res.json();
      const url = extractImageUrl(data?.data?.[0], outputFormat);
      if (!url) {
        throw new Error("GPT Image 2 returned no image data.");
      }
      return url;
    }
  );
}

export async function generateRepoIllustrations(
  apiKey: string | undefined,
  repoData: {
    full_name: string;
    description: string;
    readme?: string;
    topics?: string[];
    stargazers_count?: number;
    forks_count?: number;
  },
  aiDetail?: { description?: string; useCases?: string; compatibleStack?: string; strengths?: string },
  options: {
    maxImages?: number;
    layout?: "square" | "portrait" | "landscape";
    quality?: ImageOptions["quality"];
    concurrency?: number;
    onImageGenerated?: (index: number, url: string) => void;
    onImageError?: (index: number, error: Error) => void;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<{ plan: RepoIllustrationPlan; images: string[]; tokens: number }> {
  const { plan, tokens } = await generateRepoIllustrationPlan(apiKey, repoData, aiDetail, {
    maxImages: options.maxImages,
    layout: options.layout,
  });

  const layout = options.layout || "landscape";
  const concurrency = clamp(options.concurrency || 1, 1, 2);
  const images = new Array<string>(plan.prompts.length).fill("");
  let nextIndex = 0;
  let completed = 0;

  const workers = Array.from({ length: Math.min(concurrency, plan.prompts.length) }, async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= plan.prompts.length) return;

      try {
        const url = await generateRepoIllustration(apiKey, plan.prompts[index], {
          layout,
          quality: options.quality || "high",
          background: "auto",
          outputFormat: "png",
        });

        images[index] = url;
        options.onImageGenerated?.(index, url);
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        options.onImageError?.(index, normalizedError);
      } finally {
        completed += 1;
        options.onProgress?.(completed, plan.prompts.length);
      }
    }
  });

  await Promise.all(workers);

  return { plan, images, tokens };
}