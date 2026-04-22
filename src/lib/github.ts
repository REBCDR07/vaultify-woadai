const GITHUB_API = "https://api.github.com";

export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
  updated_at: string;
  created_at: string;
  has_wiki: boolean;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  blog: string | null;
  twitter_username: string | null;
  company: string | null;
  created_at: string;
}

interface SearchFilters {
  language?: string;
  minStars?: number;
  maxStars?: number;
  license?: string;
  updatedAfter?: string;
}

function getHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function buildQuery(query: string, filters: SearchFilters): string {
  let q = query;
  if (filters.language) q += ` language:${filters.language}`;
  if (filters.minStars) q += ` stars:>=${filters.minStars}`;
  if (filters.maxStars) q += ` stars:<=${filters.maxStars}`;
  if (filters.license) q += ` license:${filters.license}`;
  if (filters.updatedAfter) q += ` pushed:>${filters.updatedAfter}`;
  return q;
}

export async function searchRepos(
  query: string,
  filters: SearchFilters = {},
  perPage = 30,
  token?: string
): Promise<GitHubRepo[]> {
  const q = encodeURIComponent(buildQuery(query, filters));
  const res = await fetch(
    `${GITHUB_API}/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perPage}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

export async function searchReposParallel(
  queries: string[],
  filters: SearchFilters = {},
  token?: string
): Promise<GitHubRepo[]> {
  const results = await Promise.all(queries.map((q) => searchRepos(q, filters, 30, token)));
  const seen = new Set<number>();
  const merged: GitHubRepo[] = [];
  for (const list of results) {
    for (const repo of list) {
      if (!seen.has(repo.id)) {
        seen.add(repo.id);
        merged.push(repo);
      }
    }
  }
  return merged;
}

export async function getRepoDetails(owner: string, repo: string, token?: string): Promise<GitHubRepo> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function getRepoReadme(owner: string, repo: string, token?: string): Promise<string> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
      headers: { ...getHeaders(token), Accept: "application/vnd.github.v3.raw" },
    });
    if (!res.ok) return "";
    return res.text();
  } catch {
    return "";
  }
}

const BENIN_LOCATIONS = [
  "Benin",
  "Bénin",
  "Cotonou",
  "Porto-Novo",
  "Porto Novo",
  "Parakou",
  "Abomey-Calavi",
  "Abomey",
  "Bohicon",
  "Natitingou",
  "Djougou",
  "Lokossa",
  "Ouidah",
  "Kandi",
  "Savalou",
  "Comè",
  "Dassa-Zoumè",
  "Malanville",
  "Pobè",
  "Sakété",
  "Sèmè-Podji",
  "Allada",
  "Aplahoué",
  "Bembèrèkè",
  "Tchaourou",
];

const BENIN_KEYWORDS = [
  "benin",
  "bénin",
  "cotonou",
  "porto",
  "parakou",
  "abomey",
  "ouidah",
  "natitingou",
  "developer",
  "software",
  "engineer",
  "développeur",
  "freelance",
];

const SEARCH_REQUEST_PLAN = {
  anonymous: {
    maxQueries: 8,
    extraPagesForTopQueries: 0,
    maxRequests: 8,
    batchSize: 3,
  },
  authenticated: {
    maxQueries: 14,
    extraPagesForTopQueries: 4,
    maxRequests: 22,
    batchSize: 6,
  },
} as const;

function dedupeQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const q of queries) {
    const normalized = q.trim().replace(/\s+/g, " ");
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    deduped.push(normalized);
  }

  return deduped;
}

async function fetchUsersPage(
  q: string,
  page: number,
  perPage: number,
  token?: string
): Promise<{ items: GitHubUser[]; total_count: number; incomplete_results: boolean }> {
  const res = await fetch(
    `${GITHUB_API}/search/users?q=${encodeURIComponent(q)}&sort=followers&order=desc&per_page=${perPage}&page=${page}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) return { items: [], total_count: 0, incomplete_results: false };
  return res.json();
}

function buildUserQueryParts(
  query: string,
  filters?: { language?: string; minFollowers?: number; minRepos?: number }
): string[] {
  const typed = "type:user";
  const qualifiers = [
    filters?.language ? `language:${filters.language}` : "",
    filters?.minFollowers ? `followers:>=${filters.minFollowers}` : "",
    filters?.minRepos ? `repos:>=${filters.minRepos}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const userTerm = query.trim();
  const identityProbe = userTerm ? `${userTerm} in:login,name,fullname,bio,company,blog` : "";

  const broadQueries = [
    [userTerm, 'location:"Benin"', typed, qualifiers].filter(Boolean).join(" "),
    [identityProbe, typed, qualifiers, 'location:"Benin"'].filter(Boolean).join(" "),
    ["benin in:login,name,fullname,bio,company,blog", typed, qualifiers].filter(Boolean).join(" "),
  ];

  const locationQueries = BENIN_LOCATIONS.flatMap((loc) => {
    const byLocation = [userTerm, `location:"${loc}"`, typed, qualifiers].filter(Boolean).join(" ");
    const byIdentity = [`${loc} in:login,name,fullname,bio,company,blog`, typed, qualifiers].filter(Boolean).join(" ");
    return [byLocation, byIdentity];
  });

  const keywordQueries = BENIN_KEYWORDS.map((kw) => {
    const base = `${kw} in:login,name,fullname,bio,company,blog`;
    return [userTerm, base, typed, qualifiers].filter(Boolean).join(" ");
  });

  return dedupeQueries([...broadQueries, ...locationQueries, ...keywordQueries]);
}

export async function searchBeninDevelopers(
  query: string = "",
  page: number = 1,
  perPage: number = 30,
  token?: string,
  filters?: { language?: string; minFollowers?: number; minRepos?: number }
): Promise<{ users: GitHubUser[]; totalCount: number }> {
  const queries = buildUserQueryParts(query, filters);
  const firstQuery = queries[0] || `location:"Benin" type:user`;
  const data = await fetchUsersPage(firstQuery, page, perPage, token);
  return { users: data.items || [], totalCount: data.total_count || 0 };
}

export async function deepSearchBeninDevelopers(
  query: string = "",
  token?: string,
  filters?: { language?: string; minFollowers?: number; minRepos?: number }
): Promise<{ users: GitHubUser[]; totalCount: number }> {
  const searchQueries = buildUserQueryParts(query, filters);
  const plan = token ? SEARCH_REQUEST_PLAN.authenticated : SEARCH_REQUEST_PLAN.anonymous;
  const perPage = 100;

  const selectedQueries = searchQueries.slice(0, plan.maxQueries);
  const requestPlan: Array<{ q: string; page: number }> = [];

  selectedQueries.forEach((q, index) => {
    requestPlan.push({ q, page: 1 });
    if (plan.extraPagesForTopQueries > 0 && index < plan.extraPagesForTopQueries) {
      requestPlan.push({ q, page: 2 });
    }
  });

  const boundedPlan = requestPlan.slice(0, plan.maxRequests);
  const results: Array<{ items: GitHubUser[]; total_count: number; incomplete_results: boolean }> = [];

  for (let i = 0; i < boundedPlan.length; i += plan.batchSize) {
    const chunk = boundedPlan.slice(i, i + plan.batchSize);
    const chunkResults = await Promise.all(
      chunk.map(({ q, page }) => fetchUsersPage(q, page, perPage, token))
    );
    results.push(...chunkResults);
  }

  const seen = new Set<number>();
  const merged: GitHubUser[] = [];

  for (const data of results) {
    for (const user of data.items || []) {
      if (!seen.has(user.id)) {
        seen.add(user.id);
        merged.push(user);
      }
    }
  }

  return { users: merged, totalCount: merged.length };
}

export async function getUserDetails(username: string, token?: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/users/${username}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function getUserRepos(
  username: string,
  token?: string,
  perPage = 30
): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=stars&direction=desc&per_page=${perPage}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}
