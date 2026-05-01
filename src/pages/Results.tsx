import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "@/components/search/SearchBar";
import RepoCard from "@/components/results/RepoCard";
import SkeletonCard from "@/components/results/SkeletonCard";
import SaveModal from "@/components/favorites/SaveModal";
import { useStore } from "@/store/useStore";
import { searchReposParallel, type GitHubRepo } from "@/lib/github";
import { reformulateQuery, scoreAndSummarize, generateSuggestions } from "@/lib/ai";
import { Zap, Filter } from "lucide-react";

interface EnrichedRepo {
  repo: GitHubRepo;
  score?: number;
  summary?: string;
  useCases?: string;
  strengths?: string;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 min

const Results = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const {
    aiModel,
    lewisApiKey,
    githubToken,
    addTokens,
    addSearchLog,
    favorites,
    cachedSearch,
    setCachedSearch,
  } = useStore();

  const [results, setResults] = useState<EnrichedRepo[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [saveModal, setSaveModal] = useState<EnrichedRepo | null>(null);

  const [filterLang, setFilterLang] = useState("");
  const [filterMinStars, setFilterMinStars] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const hasSearchedRef = useRef(false);

  const aiEnabled = true;

  const performSearch = useCallback(async (q: string) => {
    if (!q) return;
    setLoading(true);
    setResults([]);
    setSuggestions([]);
    setTokensUsed(0);

    let totalTokens = 0;
    let nextSuggestions: string[] = [];

    try {
      let queries = [q];

      if (aiEnabled) {
        try {
          const { queries: reformulated, tokens } = await reformulateQuery(lewisApiKey, aiModel, q);
          queries = reformulated.length > 0 ? reformulated : [q];
          totalTokens += tokens;
        } catch (e) {
          console.error("Reformulation error:", e);
        }
      }

      const repos = await searchReposParallel(
        queries,
        {
          language: filterLang || undefined,
          minStars: filterMinStars || undefined,
        },
        githubToken || undefined
      );

      let enrichedResults: EnrichedRepo[];

      if (aiEnabled && repos.length > 0) {
        try {
          const { results: scored, tokens } = await scoreAndSummarize(
            lewisApiKey,
            aiModel,
            q,
            repos.slice(0, 40)
          );
          totalTokens += tokens;

          const enriched: EnrichedRepo[] = scored
            .map((s) => {
              const repo = repos.find((r) => r.full_name === s.full_name);
              return repo
                ? {
                    repo,
                    score: s.score,
                    summary: s.summary,
                    useCases: s.useCases,
                    strengths: s.strengths,
                  }
                : null;
            })
            .filter(Boolean) as EnrichedRepo[];

          const scoredNames = new Set(scored.map((s) => s.full_name));
          const unscored = repos.filter((r) => !scoredNames.has(r.full_name)).map((r) => ({ repo: r }));
          enrichedResults = [...enriched, ...unscored];

          try {
            const { suggestions: sug, tokens: sugTokens } = await generateSuggestions(lewisApiKey, aiModel, q);
            nextSuggestions = sug;
            setSuggestions(sug);
            totalTokens += sugTokens;
          } catch {
            nextSuggestions = [];
          }
        } catch (e) {
          console.error("Scoring error:", e);
          enrichedResults = repos.map((r) => ({ repo: r }));
        }
      } else {
        enrichedResults = repos.map((r) => ({ repo: r }));
      }

      setResults(enrichedResults);
      setTokensUsed(totalTokens);
      if (totalTokens > 0) addTokens(totalTokens);

      addSearchLog({ id: crypto.randomUUID(), query: q, searched_at: new Date().toISOString() });

      setCachedSearch({
        query: q,
        results: enrichedResults,
        suggestions: nextSuggestions,
        tokensUsed: totalTokens,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  }, [aiModel, aiEnabled, githubToken, filterLang, filterMinStars, addTokens, addSearchLog, setCachedSearch]);

  useEffect(() => {
    if (!query) return;

    if (cachedSearch && cachedSearch.query === query && Date.now() - cachedSearch.timestamp < CACHE_TTL) {
      setResults(cachedSearch.results as EnrichedRepo[]);
      setSuggestions(cachedSearch.suggestions);
      setTokensUsed(cachedSearch.tokensUsed);
      hasSearchedRef.current = true;
      return;
    }

    if (!hasSearchedRef.current) {
      hasSearchedRef.current = true;
      performSearch(query);
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    hasSearchedRef.current = false;
  }, [query]);

  const isSaved = (name: string) => favorites.some((f) => f.full_name === name);

  return (
    <div className="container px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <SearchBar initialQuery={query} />
      </div>

      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="font-label text-sm text-muted-foreground">
            {loading ? "Recherche en cours..." : `${results.length} résultats`}
          </h2>
          {tokensUsed > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-label text-foreground">
              <Zap className="h-3 w-3" />
              {tokensUsed} tokens
            </span>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-label text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Filtres
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-3 rounded-xl border border-border bg-card p-4 animate-slide-up">
          <div>
            <label className="mb-1 block font-label text-[10px] text-muted-foreground uppercase">Langage</label>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-ring"
            >
              <option value="">Tous</option>
              {["JavaScript", "TypeScript", "Python", "Rust", "Go", "Java", "C++", "Ruby", "PHP", "Swift", "Kotlin", "Dart"].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-label text-[10px] text-muted-foreground uppercase">Stars min</label>
            <input
              type="number"
              value={filterMinStars}
              onChange={(e) => setFilterMinStars(Number(e.target.value))}
              className="w-full sm:w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-ring"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                hasSearchedRef.current = false;
                performSearch(query);
              }}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-label text-primary-foreground hover:bg-primary/90"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : results.map(({ repo, score, summary, useCases, strengths }) => (
              <RepoCard
                key={repo.id}
                full_name={repo.full_name}
                html_url={repo.html_url}
                stars={repo.stargazers_count}
                language={repo.language}
                topics={repo.topics || []}
                updated_at={repo.updated_at}
                license={repo.license?.spdx_id}
                score={score}
                summary={summary}
                useCases={useCases}
                strengths={strengths}
                isSaved={isSaved(repo.full_name)}
                onSave={() => setSaveModal({ repo, score, summary, useCases, strengths })}
              />
            ))}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-label text-xs text-muted-foreground uppercase tracking-wider">
            Recherches connexes
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <a
                key={i}
                href={`/results?q=${encodeURIComponent(s)}`}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-ring/50 transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      )}

      {saveModal && (
        <SaveModal
          open={!!saveModal}
          onClose={() => setSaveModal(null)}
          repoData={{
            full_name: saveModal.repo.full_name,
            html_url: saveModal.repo.html_url,
            stars: saveModal.repo.stargazers_count,
            language: saveModal.repo.language,
            topics: saveModal.repo.topics || [],
            summary: saveModal.summary || "",
          }}
        />
      )}
    </div>
  );
};

export default Results;
