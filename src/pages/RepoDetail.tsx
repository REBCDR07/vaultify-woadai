import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRepoDetails, getRepoReadme, type GitHubRepo } from "@/lib/github";
import { generateRepoDetail } from "@/lib/ai";
import { useStore } from "@/store/useStore";
import SaveModal from "@/components/favorites/SaveModal";
import MarkdownReadme from "@/components/results/MarkdownReadme";
import { Star, GitFork, Eye, AlertCircle, ExternalLink, Bookmark, ArrowLeft, Zap } from "lucide-react";

const RepoDetail = () => {
  const { owner, repo: repoName } = useParams();
  const navigate = useNavigate();
  const { aiModel, lewisApiKey, githubToken, addTokens, favorites } = useStore();

  const [repoData, setRepoData] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState("");
  const [aiDetail, setAiDetail] = useState<{
    description: string;
    useCases: string;
    compatibleStack: string;
    strengths: string;
    similar: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSave, setShowSave] = useState(false);

  const isSaved = favorites.some((f) => f.full_name === `${owner}/${repoName}`);
  const aiEnabled = true;

  useEffect(() => {
    if (!owner || !repoName) return;
    setLoading(true);

    Promise.all([
      getRepoDetails(owner, repoName, githubToken || undefined),
      getRepoReadme(owner, repoName, githubToken || undefined),
    ])
      .then(([data, rm]) => {
        setRepoData(data);
        setReadme(rm);
        setLoading(false);

        if (aiEnabled) {
          setAiLoading(true);
          generateRepoDetail(lewisApiKey, aiModel, {
            full_name: data.full_name,
            description: data.description,
            readme: rm,
          })
            .then(({ detail, tokens }) => {
              setAiDetail(detail);
              addTokens(tokens);
            })
            .catch(console.error)
            .finally(() => setAiLoading(false));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [owner, repoName, githubToken, aiModel, aiEnabled, addTokens]);

  if (loading) {
    return (
      <div className="container px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-1/2 rounded bg-secondary" />
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-4 w-3/4 rounded bg-secondary" />
          <div className="mt-8 h-64 rounded-xl bg-secondary" />
        </div>
      </div>
    );
  }

  if (!repoData) {
    return (
      <div className="container px-4 py-12 text-center text-muted-foreground">
        Repository non trouve
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground break-all">{repoData.full_name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{repoData.description}</p>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-2 sm:shrink-0">
              <button
                onClick={() => setShowSave(true)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                  isSaved
                    ? "border-warning/50 bg-warning/10 text-warning"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
              </button>
              <a
                href={repoData.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-label text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                GitHub
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <Stat icon={<Star className="h-4 w-4 text-warning" />} value={repoData.stargazers_count.toLocaleString()} label="Stars" />
            <Stat icon={<GitFork className="h-4 w-4 text-primary" />} value={repoData.forks_count.toLocaleString()} label="Forks" />
            <Stat icon={<Eye className="h-4 w-4 text-accent" />} value={repoData.watchers_count.toLocaleString()} label="Watchers" />
            <Stat icon={<AlertCircle className="h-4 w-4 text-destructive" />} value={repoData.open_issues_count.toLocaleString()} label="Issues" />
          </div>

          {repoData.topics && repoData.topics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {repoData.topics.map((t) => (
                <button
                  key={t}
                  onClick={() => navigate(`/results?q=${encodeURIComponent(t)}`)}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-label text-primary hover:bg-primary/20 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {aiLoading && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-pulse">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4 animate-pulse-glow" />
              <span className="font-label text-xs">Analyse IA en cours...</span>
            </div>
          </div>
        )}

        {aiDetail && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-primary/20 bg-card p-4 sm:p-5">
              <h2 className="flex items-center gap-2 font-label text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Analyse IA
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{aiDetail.description}</p>
              {aiDetail.useCases && (
                <div className="mt-3">
                  <h3 className="font-label text-xs text-muted-foreground uppercase">Cas d'usage</h3>
                  <p className="mt-1 text-sm text-foreground">{aiDetail.useCases}</p>
                </div>
              )}
              {aiDetail.compatibleStack && (
                <div className="mt-3">
                  <h3 className="font-label text-xs text-muted-foreground uppercase">Stack compatible</h3>
                  <p className="mt-1 text-sm text-foreground">{aiDetail.compatibleStack}</p>
                </div>
              )}
              {aiDetail.strengths && (
                <div className="mt-3">
                  <h3 className="font-label text-xs text-muted-foreground uppercase">Points forts</h3>
                  <p className="mt-1 text-sm text-foreground">{aiDetail.strengths}</p>
                </div>
              )}
            </div>

            {aiDetail.similar && aiDetail.similar.length > 0 && (
              <div>
                <h3 className="mb-2 font-label text-xs text-muted-foreground uppercase">Repos similaires</h3>
                <div className="flex flex-wrap gap-2">
                  {aiDetail.similar.map((s) => (
                    <button
                      key={s}
                      onClick={() => navigate(`/results?q=${encodeURIComponent(s)}`)}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {readme && (
          <div className="mt-6">
            <h2 className="mb-3 font-label text-sm font-medium text-muted-foreground uppercase">README</h2>
            <MarkdownReadme content={readme} />
          </div>
        )}
      </div>

      {showSave && (
        <SaveModal
          open={showSave}
          onClose={() => setShowSave(false)}
          repoData={{
            full_name: repoData.full_name,
            html_url: repoData.html_url,
            stars: repoData.stargazers_count,
            language: repoData.language,
            topics: repoData.topics || [],
            summary: aiDetail?.description || repoData.description || "",
          }}
        />
      )}
    </div>
  );
};

const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
    {icon}
    <div className="min-w-0">
      <span className="block text-sm font-semibold text-foreground truncate">{value}</span>
      <span className="block text-[11px] text-muted-foreground">{label}</span>
    </div>
  </div>
);

export default RepoDetail;
