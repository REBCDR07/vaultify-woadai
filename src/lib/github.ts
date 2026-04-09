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

interface SearchFilters {
  language?: string;
  minStars?: number;
  maxStars?: number;
  license?: string;
  updatedAfter?: string;
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
  perPage = 30
): Promise<GitHubRepo[]> {
  const q = encodeURIComponent(buildQuery(query, filters));
  const res = await fetch(
    `${GITHUB_API}/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perPage}`,
    { headers: { Accept: "application/vnd.github.v3+json" } }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

export async function searchReposParallel(
  queries: string[],
  filters: SearchFilters = {}
): Promise<GitHubRepo[]> {
  const results = await Promise.all(queries.map((q) => searchRepos(q, filters, 30)));
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

export async function getRepoDetails(owner: string, repo: string): Promise<GitHubRepo> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function getRepoReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
      headers: { Accept: "application/vnd.github.v3.raw" },
    });
    if (!res.ok) return "";
    return res.text();
  } catch {
    return "";
  }
}
