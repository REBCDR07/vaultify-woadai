// Vaultify AI client — routes every call through the LewisNote ai-proxy
// edge function. Server-side keys (LEWISNOTE_API_KEY_1..5) provide automatic
// fallback. The user can optionally pass their own LewisNote key (BYOK).

import { callAI, safeParseJSON, type AIMessage } from "./aiProxy";

interface ChatOptions {
  reasoningEffort?: "none" | "low" | "medium" | "high";
  webSearch?: boolean;
}

// Always considered "configured" — the proxy has server keys.
export function isAiConfigured(_overrideKey?: string): boolean {
  return true;
}

export async function callAi(
  apiKey: string | undefined,
  model: string,
  messages: AIMessage[],
  options: ChatOptions = {},
): Promise<{ content: string; tokens: number }> {
  const { content, tokens } = await callAI({
    model,
    messages,
    reasoning_effort: options.reasoningEffort ?? "medium",
    web_search: options.webSearch ?? false,
    userKey: apiKey?.trim() || undefined,
  });
  return { content, tokens };
}

export async function reformulateQuery(
  apiKey: string | undefined,
  model: string,
  query: string,
): Promise<{ queries: string[]; tokens: number }> {
  const { content, tokens } = await callAi(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Tu es un expert en recherche GitHub. L'utilisateur décrit un besoin en langage naturel.
Génère exactement 3 requêtes GitHub Search API optimisées couvrant différents angles sémantiques.
Réponds UNIQUEMENT avec un JSON array de 3 strings. Exemple: ["q1","q2","q3"]`,
      },
      { role: "user", content: query },
    ],
    { reasoningEffort: "low", webSearch: true },
  );
  const parsed = safeParseJSON<string[]>(content, [query]);
  return {
    queries: Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, 3) : [query],
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
  }>,
): Promise<{
  results: Array<{
    full_name: string;
    score: number;
    summary: string;
    useCases: string;
    strengths: string;
  }>;
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
        content: `Expert senior en évaluation de repos GitHub. Analyse chaque repo par rapport à la requête.
Retourne un JSON array trié par pertinence décroissante (top 10 max). Chaque élément:
{ "full_name": string, "score": number 0-100, "summary": string (3-4 phrases riches),
  "useCases": string, "strengths": string }
Réponds UNIQUEMENT avec le JSON array.`,
      },
      { role: "user", content: `Requête: "${originalQuery}"\n\nRepos:\n${JSON.stringify(repoList)}` },
    ],
    { reasoningEffort: "medium" },
  );

  const parsed = safeParseJSON<any[]>(content, []);
  return { results: Array.isArray(parsed) ? parsed : [], tokens };
}

export async function generateSuggestions(
  apiKey: string | undefined,
  model: string,
  originalQuery: string,
): Promise<{ suggestions: string[]; tokens: number }> {
  const { content, tokens } = await callAi(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Génère 4 recherches connexes pertinentes basées sur la requête.
Réponds UNIQUEMENT avec un JSON array de 4 strings courts.`,
      },
      { role: "user", content: originalQuery },
    ],
    { reasoningEffort: "low" },
  );
  const sug = safeParseJSON<string[]>(content, []);
  return { suggestions: Array.isArray(sug) ? sug : [], tokens };
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
  }>,
): Promise<{
  profile: {
    summary: string;
    expertise: string;
    collaborationFit: string;
    projectSuggestions: string;
    ranking: string;
  };
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
        content: `Expert en analyse de profils dev GitHub. Analyse ce profil de fond en comble.
Retourne un JSON: { "summary": string (paragraphe détaillé), "expertise": string,
"collaborationFit": string, "projectSuggestions": string, "ranking": string (junior/mid/senior/expert + justif) }.
Réponds UNIQUEMENT avec le JSON.`,
      },
      {
        role: "user",
        content: `Profil: ${user.name || user.login}
Bio: ${user.bio || "N/A"}
Location: ${user.location || "N/A"}
Company: ${user.company || "N/A"}
Followers: ${user.followers}
Repos publics: ${user.public_repos}

Top repos:
${JSON.stringify(repoSummary)}`,
      },
    ],
    { reasoningEffort: "medium" },
  );

  const profile = safeParseJSON(content, {
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
  repoData: { full_name: string; description: string; readme?: string },
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
        content: `Analyse ce repository GitHub en profondeur. Retourne JSON:
{ "description": string (paragraphe riche), "useCases": string, "compatibleStack": string,
  "strengths": string, "similar": string[] (5 noms de repos similaires) }
Réponds UNIQUEMENT avec le JSON.`,
      },
      {
        role: "user",
        content: `Repo: ${repoData.full_name}
Description: ${repoData.description}
README (extrait): ${(repoData.readme || "").slice(0, 3000)}`,
      },
    ],
    { reasoningEffort: "medium", webSearch: true },
  );

  const detail = safeParseJSON(content, {
    description: repoData.description || "",
    useCases: "",
    compatibleStack: "",
    strengths: "",
    similar: [] as string[],
  });
  return { detail, tokens };
}
