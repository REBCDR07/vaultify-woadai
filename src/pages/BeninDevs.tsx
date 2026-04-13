import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { searchBeninDevelopers, getUserDetails, type GitHubUser } from "@/lib/github";
import { Search, MapPin, Users, ExternalLink, Building, Globe, Loader2 } from "lucide-react";

const BeninDevs = () => {
  const { githubToken } = useStore();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [enrichedUsers, setEnrichedUsers] = useState<Map<string, GitHubUser>>(new Map());

  const performSearch = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const { users: found, totalCount: count } = await searchBeninDevelopers(q, p, 20, githubToken || undefined);
      setUsers(found);
      setTotalCount(count);

      // Enrich with full user details (rate limit friendly: 5 at a time)
      if (githubToken) {
        const toEnrich = found.slice(0, 10);
        const enriched = new Map<string, GitHubUser>();
        for (let i = 0; i < toEnrich.length; i += 5) {
          const batch = toEnrich.slice(i, i + 5);
          const details = await Promise.all(
            batch.map((u) => getUserDetails(u.login, githubToken).catch(() => null))
          );
          details.forEach((d) => {
            if (d) enriched.set(d.login, d);
          });
        }
        setEnrichedUsers(enriched);
      }
    } catch (e) {
      console.error("Search devs error:", e);
    } finally {
      setLoading(false);
    }
  }, [githubToken]);

  useEffect(() => {
    performSearch("", 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    performSearch(query, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    performSearch(query, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getUser = (login: string): GitHubUser | undefined => enrichedUsers.get(login);

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <span className="text-2xl">🇧🇯</span>
            Développeurs Béninois
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Découvrez les talents tech du Bénin sur GitHub
          </p>
          {!githubToken && (
            <p className="mt-2 text-xs text-warning">
              Ajoutez votre token GitHub dans les paramètres pour des résultats plus complets (5000 req/h au lieu de 60)
            </p>
          )}
        </div>

        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, langage, mot-clé..."
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </form>

        <div className="mb-4 text-xs text-muted-foreground font-label">
          {loading ? "Recherche en cours..." : `${totalCount} développeurs trouvés`}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {users.map((user) => {
              const details = getUser(user.login);
              return (
                <div
                  key={user.id}
                  className="group rounded-xl border border-border bg-card p-4 card-hover animate-slide-up"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="h-12 w-12 rounded-full border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {details?.name || user.login}
                          </h3>
                          <p className="text-xs text-muted-foreground">@{user.login}</p>
                        </div>
                        <a
                          href={user.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>

                      {details?.bio && (
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{details.bio}</p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {details?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {details.location}
                          </span>
                        )}
                        {details?.company && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {details.company}
                          </span>
                        )}
                        {details && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {details.followers} followers
                          </span>
                        )}
                        {details?.blog && (
                          <a
                            href={details.blog.startsWith("http") ? details.blog : `https://${details.blog}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            Site
                          </a>
                        )}
                      </div>

                      {details && (
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="rounded-full bg-secondary px-2 py-0.5 font-label text-secondary-foreground">
                            {details.public_repos} repos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <span className="text-xs text-muted-foreground font-label">
              Page {page} / {Math.ceil(totalCount / 20)}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(totalCount / 20)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeninDevs;
