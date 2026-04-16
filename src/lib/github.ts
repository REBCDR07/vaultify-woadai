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
    Accept: "application/vnd.github.v3+json",
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

// Deep search for Benin devs: paginated + multi-location
const BENIN_LOCATIONS = [
  "Benin", "Bénin", "Cotonou", "Porto-Novo", "Parakou",
  "Abomey-Calavi", "Abomey", "Bohicon", "Natitingou",
  "Djougou", "Lokossa", "Ouidah", "Kandi", "Savalou",
  "Comè", "Dassa-Zoumè", "Malanville", "Pobè", "Sakété",
  "Sèmè-Podji", "Allada", "Aplahoué", "Bembèrèkè", "Tchaourou"
];

async function fetchUsersPage(
  q: string,
  page: number,
  perPage: number,
  token?: string
): Promise<{ items: GitHubUser[]; total_count: number }> {
  const res = await fetch(
    `${GITHUB_API}/search/users?q=${encodeURIComponent(q)}&sort=followers&order=desc&per_page=${perPage}&page=${page}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) return { items: [], total_count: 0 };
  return res.json();
}

export async function searchBeninDevelopers(
  query: string = "",
  page: number = 1,
  perPage: number = 30,
  token?: string,
  filters?: { language?: string; minFollowers?: number; minRepos?: number }
): Promise<{ users: GitHubUser[]; totalCount: number }> {
  const locations = BENIN_LOCATIONS.slice(0, 14);
  const locationQuery = locations.map(l => `location:"${l}"`).join(" ");

  let qualifiers = "";
  if (filters?.language) qualifiers += ` language:${filters.language}`;
  if (filters?.minFollowers) qualifiers += ` followers:>=${filters.minFollowers}`;
  if (filters?.minRepos) qualifiers += ` repos:>=${filters.minRepos}`;

  const q = query ? `${query} ${locationQuery}${qualifiers}` : `${locationQuery}${qualifiers}`;
  const data = await fetchUsersPage(q, page, perPage, token);
  return { users: data.items || [], totalCount: data.total_count || 0 };
}

export async function deepSearchBeninDevelopers(
  query: string = "",
  token?: string,
  filters?: { language?: string; minFollowers?: number; minRepos?: number }
): Promise<{ users: GitHubUser[]; totalCount: number }> {
  // Split locations into groups for parallel queries
  const locationGroups = [
    ['Benin', 'Bénin', 'Cotonou'],
    ['Porto-Novo', 'Abomey-Calavi', 'Parakou'],
    ['Bohicon', 'Natitingou', 'Djougou', 'Ouidah'],
    ['Lokossa', 'Kandi', 'Savalou', 'Comè'],
    ['Dassa-Zoumè', 'Malanville', 'Pobè', 'Sakété'],
    ['Sèmè-Podji', 'Allada', 'Aplahoué', 'Bembèrèkè', 'Tchaourou'],
  ];

  let qualifiers = "";
  if (filters?.language) qualifiers += ` language:${filters.language}`;
  if (filters?.minFollowers) qualifiers += ` followers:>=${filters.minFollowers}`;
  if (filters?.minRepos) qualifiers += ` repos:>=${filters.minRepos}`;

  // For each group, fetch multiple pages
  const maxPages = token ? 3 : 1;

  const allPromises: Promise<{ items: GitHubUser[]; total_count: number }>[] = [];

  for (const group of locationGroups) {
    const locQ = group.map(l => `location:"${l}"`).join(" ");
    const q = query ? `${query} ${locQ}${qualifiers}` : `${locQ}${qualifiers}`;
    for (let page = 1; page <= maxPages; page++) {
      allPromises.push(fetchUsersPage(q, page, 100, token));
    }
  }

  const results = await Promise.all(allPromises);
  const seen = new Set<number>();
  const merged: GitHubUser[] = [];
  let maxTotal = 0;

  for (const data of results) {
    maxTotal = Math.max(maxTotal, data.total_count || 0);
    for (const user of (data.items || [])) {
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
