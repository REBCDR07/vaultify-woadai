const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callGroq(
  apiKey: string,
  model: string,
  messages: GroqMessage[],
  temperature = 0.7
): Promise<{ content: string; tokens: number }> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: 2048 }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || "",
    tokens: data.usage?.total_tokens || 0,
  };
}

export async function reformulateQuery(
  apiKey: string,
  model: string,
  query: string
): Promise<{ queries: string[]; tokens: number }> {
  const { content, tokens } = await callGroq(apiKey, model, [
    {
      role: "system",
      content: `Tu es un expert en recherche GitHub. L'utilisateur décrit un besoin en langage naturel.
Génère exactement 3 requêtes de recherche GitHub Search API optimisées, couvrant différents angles sémantiques.
Réponds UNIQUEMENT avec un JSON array de 3 strings. Exemple: ["query1", "query2", "query3"]`,
    },
    { role: "user", content: query },
  ], 0.3);

  try {
    const parsed = JSON.parse(content);
    return { queries: Array.isArray(parsed) ? parsed.slice(0, 3) : [query], tokens };
  } catch {
    return { queries: [query], tokens };
  }
}

export async function scoreAndSummarize(
  apiKey: string,
  model: string,
  originalQuery: string,
  repos: Array<{ full_name: string; description: string; stargazers_count: number; language: string; topics: string[]; updated_at: string; license?: { spdx_id: string } }>
): Promise<{ results: Array<{ full_name: string; score: number; summary: string; useCases: string; strengths: string }>; tokens: number }> {
  const repoList = repos.map((r) => ({
    name: r.full_name,
    desc: r.description,
    stars: r.stargazers_count,
    lang: r.language,
    topics: r.topics,
    updated: r.updated_at,
    license: r.license?.spdx_id,
  }));

  const { content, tokens } = await callGroq(apiKey, model, [
    {
      role: "system",
      content: `Tu es un expert en évaluation de repositories GitHub.
Analyse ces repos par rapport à la requête utilisateur et retourne un JSON array trié par pertinence.
Chaque élément: { "full_name": string, "score": number (0-100), "summary": string (2-3 phrases), "useCases": string, "strengths": string }
Retourne le top 10 maximum. Réponds UNIQUEMENT avec le JSON array.`,
    },
    {
      role: "user",
      content: `Requête: "${originalQuery}"\n\nRepos:\n${JSON.stringify(repoList)}`,
    },
  ], 0.3);

  try {
    const parsed = JSON.parse(content);
    return { results: Array.isArray(parsed) ? parsed : [], tokens };
  } catch {
    return { results: [], tokens };
  }
}

export async function generateSuggestions(
  apiKey: string,
  model: string,
  originalQuery: string
): Promise<{ suggestions: string[]; tokens: number }> {
  const { content, tokens } = await callGroq(apiKey, model, [
    {
      role: "system",
      content: `Génère 4 recherches connexes pertinentes basées sur la requête de l'utilisateur.
Réponds UNIQUEMENT avec un JSON array de 4 strings courts.`,
    },
    { role: "user", content: originalQuery },
  ], 0.7);

  try {
    const parsed = JSON.parse(content);
    return { suggestions: Array.isArray(parsed) ? parsed : [], tokens };
  } catch {
    return { suggestions: [], tokens };
  }
}

export async function generateRepoDetail(
  apiKey: string,
  model: string,
  repoData: { full_name: string; description: string; readme?: string }
): Promise<{ detail: { description: string; useCases: string; compatibleStack: string; strengths: string; similar: string[] }; tokens: number }> {
  const { content, tokens } = await callGroq(apiKey, model, [
    {
      role: "system",
      content: `Analyse ce repository GitHub en détail. Retourne un JSON:
{ "description": string (paragraphe détaillé), "useCases": string, "compatibleStack": string, "strengths": string, "similar": string[] (5 noms de repos similaires) }
Réponds UNIQUEMENT avec le JSON.`,
    },
    {
      role: "user",
      content: `Repo: ${repoData.full_name}\nDescription: ${repoData.description}\nREADME (extrait): ${(repoData.readme || "").slice(0, 2000)}`,
    },
  ], 0.5);

  try {
    return { detail: JSON.parse(content), tokens };
  } catch {
    return {
      detail: { description: repoData.description || "", useCases: "", compatibleStack: "", strengths: "", similar: [] },
      tokens,
    };
  }
}
