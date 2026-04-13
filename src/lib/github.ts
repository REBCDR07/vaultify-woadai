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

export async function searchBeninDevelopers(
  query: string = "",
  page: number = 1,
  perPage: number = 30,
  token?: string
): Promise<{ users: GitHubUser[]; totalCount: number }> {
  const locationQuery = "location:Benin location:Cotonou location:Porto-Novo location:Parakou location:Abomey-Calavi";
  const q = encodeURIComponent(query ? `${query} ${locationQuery}` : locationQuery);
  const res = await fetch(
    `${GITHUB_API}/search/users?q=${q}&sort=followers&order=desc&per_page=${perPage}&page=${page}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return { users: data.items || [], totalCount: data.total_count || 0 };
}

export async function getUserDetails(username: string, token?: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/users/${username}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}
