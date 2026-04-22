import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { deepSearchBeninDevelopers, getUserDetails, type GitHubUser } from "@/lib/github";
import { Search, MapPin, Users, ExternalLink, Building, Globe, Loader2, Filter, ChevronDown, X } from "lucide-react";

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "PHP",
  "Java",
  "Go",
  "Rust",
  "C",
  "C++",
  "C#",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "HTML",
  "CSS",
];

interface Filters {
  language: string;
  minFollowers: number;
  minRepos: number;
}

const BeninDevs = () => {
  const { githubToken } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [enrichedUsers, setEnrichedUsers] = useState<Map<string, GitHubUser>>(new Map());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({ language: "", minFollowers: 0, minRepos: 0 });
  const [activeFilters, setActiveFilters] = useState<Filters>({ language: "", minFollowers: 0, minRepos: 0 });

  const performSearch = useCallback(
    async (q: string, f: Filters) => {
      setLoading(true);
      try {
        const apiFilters = {
          language: f.language || undefined,
          minFollowers: f.minFollowers || undefined,
          minRepos: f.minRepos || undefined,
        };

        const { users: found, totalCount: count } = await deepSearchBeninDevelopers(
          q,
          githubToken || undefined,
          apiFilters
        );

        setTotalCount(count);

        const limit = githubToken ? 120 : 45;
        const topCandidates = found.slice(0, limit);

        const enriched = new Map<string, GitHubUser>();
        for (let i = 0; i < topCandidates.length; i += 10) {
          const batch = topCandidates.slice(i, i + 10);
          const details = await Promise.all(
            batch.map((u) => getUserDetails(u.login, githubToken || undefined).catch(() => null))
          );
          details.forEach((d) => {
            if (d) enriched.set(d.login, d);
          });
        }

        setEnrichedUsers(enriched);

        const fallbackToBase = (u: GitHubUser) => enriched.get(u.login) || u;
        const filtered = topCandidates
          .map(fallbackToBase)
          .filter((u) => {
            if (f.minFollowers && u.followers < f.minFollowers) return false;
            if (f.minRepos && u.public_repos < f.minRepos) return false;
            return true;
          })
          .sort((a, b) => {
            const scoreA = a.followers * 2 + a.public_repos;
            const scoreB = b.followers * 2 + b.public_repos;
            return scoreB - scoreA;
          });

        setUsers(filtered);
      } catch (e) {
        console.error("Search devs error:", e);
      } finally {
        setLoading(false);
      }
    },
    [githubToken]
  );

  useEffect(() => {
    performSearch("", activeFilters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters({ ...filters });
    performSearch(query, filters);
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    setShowFilters(false);
    performSearch(query, filters);
  };

  const clearFilters = () => {
    const empty: Filters = { language: "", minFollowers: 0, minRepos: 0 };
    setFilters(empty);
    setActiveFilters(empty);
    performSearch(query, empty);
  };

  const hasActiveFilters = activeFilters.language || activeFilters.minFollowers || activeFilters.minRepos;

  const getUser = (login: string): GitHubUser | undefined => enrichedUsers.get(login);

  return (
    <div className="container px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl text-foreground flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl">🇧🇯</span>
            Devs Béninois
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-body">
            Recherche élargie par villes, variantes de localisation et mots-clés de profil GitHub
          </p>
          {!githubToken && (
            <p className="mt-2 text-xs text-warning font-body">
              Ajoutez votre token GitHub dans les paramètres pour explorer plus de profils (pagination + enrichissement)
            </p>
          )}
        </div>

        <div className="mb-4 flex gap-2">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, langage, mot-clé..."
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 sm:px-4 py-3 text-sm font-label transition-colors ${
              hasActiveFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {[activeFilters.language, activeFilters.minFollowers, activeFilters.minRepos].filter(Boolean).length}
              </span>
            )}
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4 animate-slide-up">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-label text-muted-foreground uppercase tracking-wider">Langage</label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Tous les langages</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-label text-muted-foreground uppercase tracking-wider">Followers min</label>
                <input
                  type="number"
                  min={0}
                  value={filters.minFollowers || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, minFollowers: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-label text-muted-foreground uppercase tracking-wider">Repos min</label>
                <input
                  type="number"
                  min={0}
                  value={filters.minRepos || ""}
                  onChange={(e) => setFilters((f) => ({ ...f, minRepos: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-label text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Réinitialiser
                </button>
              )}
              <button
                onClick={applyFilters}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-label font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.language && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-label text-primary">
                {activeFilters.language}
                <button
                  onClick={() => {
                    const f = { ...filters, language: "" };
                    setFilters(f);
                    setActiveFilters(f);
                    performSearch(query, f);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeFilters.minFollowers > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-label text-primary">
                ≥{activeFilters.minFollowers} followers
                <button
                  onClick={() => {
                    const f = { ...filters, minFollowers: 0 };
                    setFilters(f);
                    setActiveFilters(f);
                    performSearch(query, f);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeFilters.minRepos > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-label text-primary">
                ≥{activeFilters.minRepos} repos
                <button
                  onClick={() => {
                    const f = { ...filters, minRepos: 0 };
                    setFilters(f);
                    setActiveFilters(f);
                    performSearch(query, f);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="mb-4 text-xs text-muted-foreground font-label">
          {loading ? "Recherche en profondeur..." : `${users.length} développeurs affichés • ${totalCount} candidats bruts`}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-body">Recherche parallèle multi-queries en cours...</p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {users.map((user, index) => {
              const details = getUser(user.login) || user;
              return (
                <button
                  key={details.id}
                  onClick={() => navigate(`/dev/${details.login}`)}
                  className="group rounded-xl border border-border bg-card p-4 card-hover animate-slide-up text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img
                        src={details.avatar_url}
                        alt={details.login}
                        className="h-12 w-12 rounded-full border border-border"
                      />
                      <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <h3 className="text-sm font-heading text-foreground group-hover:text-primary transition-colors truncate">
                            {details.name || details.login}
                          </h3>
                          <p className="text-xs text-muted-foreground font-body">@{details.login}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>

                      {details.bio && <p className="mt-1.5 text-xs text-muted-foreground font-body line-clamp-2">{details.bio}</p>}

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-body">
                        {details.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {details.location}
                          </span>
                        )}
                        {details.company && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {details.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {details.followers}
                        </span>
                        {details.blog && (
                          <span className="flex items-center gap-1 text-primary">
                            <Globe className="h-3 w-3" />
                            Site
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-label text-secondary-foreground">
                          {details.public_repos} repos
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-label text-secondary-foreground">
                          {details.following} following
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground font-body">Aucun développeur trouvé. Essayez d'autres filtres.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeninDevs;
