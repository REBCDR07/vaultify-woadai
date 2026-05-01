// Compatibility layer: keeps the old function signatures used across the app
// but now routes everything through the LewisNote proxy edge function.
// The first argument (apiKey) is treated as the optional user BYOK key.

import { callAI, safeParseJSON, type AIMessage } from "./aiProxy";

async function ask(
  userKey: string,
  model: string,
  messages: AIMessage[],
  opts: { temperature?: number; web_search?: boolean; reasoning_effort?: "none" | "low" | "medium" | "high" } = {},
) {
  return await callAI({
    model,
    messages,
    temperature: opts.temperature ?? 0.4,
    web_search: opts.web_search,
    reasoning_effort: opts.reasoning_effort,
    userKey: userKey || undefined,
  });
}

export async function callGroq(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  temperature = 0.7,
): Promise<{ content: string; tokens: number }> {
  const { content, tokens } = await ask(apiKey, model, messages, { temperature });
  return { content, tokens };
}

export async function reformulateQuery(
  apiKey: string,
  model: string,
  query: string,
): Promise<{ queries: string[]; tokens: number }> {
  const { content, tokens } = await ask(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Tu es un expert en recherche GitHub. Génère exactement 3 requêtes GitHub Search API optimisées couvrant différents angles. Réponds UNIQUEMENT avec un JSON array de 3 strings.`,
      },
      { role: "user", content: query },
    ],
    { temperature: 0.3, web_search: true, reasoning_effort: "low" },
  );
  const queries = safeParseJSON<string[]>(content, [query]);
  return { queries: Array.isArray(queries) ? queries.slice(0, 3) : [query], tokens };
}

export async function scoreAndSummarize(
  apiKey: string,
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

  const { content, tokens } = await ask(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Expert en évaluation de repos GitHub. Pour chaque repo donne une analyse approfondie.
Retourne un JSON array trié par pertinence décroissante (top 10 max). Chaque élément:
{ "full_name": string, "score": number 0-100, "summary": string (3-4 phrases riches), "useCases": string, "strengths": string }
Réponds UNIQUEMENT avec le JSON array.`,
      },
      { role: "user", content: `Requête: "${originalQuery}"\n\nRepos:\n${JSON.stringify(repoList)}` },
    ],
    { temperature: 0.3, reasoning_effort: "medium" },
  );

  const parsed = safeParseJSON<any[]>(content, []);
  return { results: Array.isArray(parsed) ? parsed : [], tokens };
}

export async function generateSuggestions(
  apiKey: string,
  model: string,
  originalQuery: string,
): Promise<{ suggestions: string[]; tokens: number }> {
  const { content, tokens } = await ask(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Génère 4 recherches connexes pertinentes. Réponds UNIQUEMENT avec un JSON array de 4 strings courts.`,
      },
      { role: "user", content: originalQuery },
    ],
    { temperature: 0.7 },
  );
  const sug = safeParseJSON<string[]>(content, []);
  return { suggestions: Array.isArray(sug) ? sug : [], tokens };
}

export async function analyzeDevProfile(
  apiKey: string,
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
  const { content, tokens } = await ask(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Expert en analyse de profils dev GitHub. Vacuum tout le profil.
Retourne JSON: { "summary": string, "expertise": string, "collaborationFit": string, "projectSuggestions": string, "ranking": string }.
Réponds UNIQUEMENT avec le JSON.`,
      },
      {
        role: "user",
        content: `Profil: ${user.name || user.login}\nBio: ${user.bio || "N/A"}\nLocation: ${user.location || "N/A"}\nCompany: ${
          user.company || "N/A"
        }\nFollowers: ${user.followers}\nRepos: ${user.public_repos}\n\nTop repos:\n${JSON.stringify(repoSummary)}`,
      },
    ],
    { temperature: 0.4, reasoning_effort: "medium" },
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
  apiKey: string,
  model: string,
  repoData: { full_name: string; description: string; readme?: string },
): Promise<{
  detail: { description: string; useCases: string; compatibleStack: string; strengths: string; similar: string[] };
  tokens: number;
}> {
  const { content, tokens } = await ask(
    apiKey,
    model,
    [
      {
        role: "system",
        content: `Analyse ce repo en profondeur. Retourne JSON:
{ "description": string (paragraphe riche), "useCases": string, "compatibleStack": string, "strengths": string, "similar": string[] (5 noms) }
Réponds UNIQUEMENT avec le JSON.`,
      },
      {
        role: "user",
        content: `Repo: ${repoData.full_name}\nDescription: ${repoData.description}\nREADME (extrait): ${(repoData.readme || "").slice(0, 3000)}`,
      },
    ],
    { temperature: 0.5, web_search: true, reasoning_effort: "medium" },
  );

  const detail = safeParseJSON(content, {
    description: repoData.description || "",
    useCases: "",
    compatibleStack: "",
    strengths: "",
    similar: [],
  });
  return { detail, tokens };
}
