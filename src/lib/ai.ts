const REPO_ANALYSIS_MODEL = "gpt-5.3-codex";

const API_BASE_URL = import.meta.env.VITE_AI_BASE_URL || "https://build.lewisnote.com/v1";
const ENV_API_KEYS = [
  import.meta.env.VITE_AI_API_KEY,
  import.meta.env.VITE_AI_API_KEY_2,
  import.meta.env.VITE_AI_API_KEY_3,
]
  .map((key) => key?.trim() || "")
  .filter(Boolean);

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  reasoningEffort?: "none" | "low" | "medium" | "high";
  webSearch?: boolean;
}

function getApiKey(overrideKey?: string): string {
  const manual = overrideKey?.trim();
  if (manual) return manual;
  return ENV_API_KEYS[0] || "";
}

function getApiKeyCandidates(overrideKey?: string): string[] {
  const manual = overrideKey?.trim();
  if (!manual) return ENV_API_KEYS;
  return [manual, ...ENV_API_KEYS.filter((key) => key !== manual)];
}

function shouldRetryWithNextKey(status: number): boolean {
  return status === 401 || status === 403 || status === 429 || status >= 500;
}

export function isAiConfigured(overrideKey?: string): boolean {
  return Boolean(getApiKey(overrideKey));
}

export async function callAi(
  apiKey: string | undefined,
  model: string,
  messages: AiMessage[],
  options: ChatOptions = {}
): Promise<{ content: string; tokens: number }> {
  const keyCandidates = getApiKeyCandidates(apiKey);
  if (keyCandidates.length === 0) {
    throw new Error(
      "Missing AI API key. Configure VITE_AI_API_KEY (and optionally VITE_AI_API_KEY_2 / VITE_AI_API_KEY_3)."
    );
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    reasoning_effort: options.reasoningEffort ?? "medium",
    web_search: options.webSearch ?? false,
  };

  let lastError: string | null = null;

  for (let i = 0; i < keyCandidates.length; i += 1) {
    const key = keyCandidates[i];
    const res = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        content: data.choices?.[0]?.message?.content || "",
        tokens: data.usage?.total_tokens || 0,
      };
    }

    const err = await res.text();
    lastError = `AI API error (${res.status}): ${err}`;

    if (i < keyCandidates.length - 1 && shouldRetryWithNextKey(res.status)) {
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError || "AI API error: all configured keys failed.");
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
Genere exactement 4 requetes GitHub Search API optimisées pour couvrir des angles differents.
Reponds UNIQUEMENT avec un JSON array de 4 strings.`,
      },
      { role: "user", content: query },
    ],
    { reasoningEffort: "medium", webSearch: false }
  );

  try {
    const parsed = JSON.parse(content);
    return { queries: Array.isArray(parsed) ? parsed.slice(0, 4) : [query], tokens };
  } catch {
    return { queries: [query], tokens };
  }
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
Retourne UNIQUEMENT un JSON array trie par pertinence decroissante (max 15).
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
    { reasoningEffort: "high", webSearch: false }
  );

  try {
    const parsed = JSON.parse(content);
    return { results: Array.isArray(parsed) ? parsed : [], tokens };
  } catch {
    return { results: [], tokens };
  }
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
        content: "Genere 4 recherches connexes pertinentes. Reponds UNIQUEMENT avec un JSON array de 4 strings.",
      },
      { role: "user", content: originalQuery },
    ],
    { reasoningEffort: "low", webSearch: true }
  );

  try {
    const parsed = JSON.parse(content);
    return { suggestions: Array.isArray(parsed) ? parsed : [], tokens };
  } catch {
    return { suggestions: [], tokens };
  }
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

  try {
    return { profile: JSON.parse(content), tokens };
  } catch {
    return {
      profile: { summary: "", expertise: "", collaborationFit: "", projectSuggestions: "", ranking: "" },
      tokens,
    };
  }
}

export async function generateRepoDetail(
  apiKey: string | undefined,
  model: string,
  repoData: { full_name: string; description: string; readme?: string }
): Promise<{
  detail: { description: string; useCases: string; compatibleStack: string; strengths: string; similar: string[] };
  tokens: number;
}> {
  const { content, tokens } = await callAi(
    apiKey,
    REPO_ANALYSIS_MODEL === model ? model : REPO_ANALYSIS_MODEL,
    [
      {
        role: "system",
        content: `Analyse ce repository GitHub en detail.
Retourne UNIQUEMENT un JSON:
{
  "description": string,
  "useCases": string,
  "compatibleStack": string,
  "strengths": string,
  "similar": string[]
}`,
      },
      {
        role: "user",
        content: `Repo: ${repoData.full_name}\nDescription: ${repoData.description}\nREADME (extrait): ${(repoData.readme || "").slice(0, 8000)}`,
      },
    ],
    { reasoningEffort: "high", webSearch: false }
  );

  try {
    return { detail: JSON.parse(content), tokens };
  } catch {
    return {
      detail: { description: repoData.description || "", useCases: "", compatibleStack: "", strengths: "", similar: [] },
      tokens,
    };
  }
}
