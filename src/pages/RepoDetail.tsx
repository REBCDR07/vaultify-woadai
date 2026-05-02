import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRepoDetails, getRepoReadme, type GitHubRepo } from "@/lib/github";
import { generateRepoDetail, generateRepoIllustrations } from "@/lib/ai";
import { useStore } from "@/store/useStore";
import SaveModal from "@/components/favorites/SaveModal";
import MarkdownReadme from "@/components/results/MarkdownReadme";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Star,
  GitFork,
  Eye,
  AlertCircle,
  ExternalLink,
  Bookmark,
  ArrowLeft,
  Zap,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Download,
} from "lucide-react";

const LAYOUT_OPTIONS = [
  { value: "landscape", label: "Paysage", hint: "3:2" },
  { value: "portrait", label: "Portrait", hint: "2:3" },
  { value: "square", label: "Carre", hint: "1:1" },
] as const;

const IMAGE_COUNT_OPTIONS = [3, 4, 5, 6] as const;

type IllustrationLayout = (typeof LAYOUT_OPTIONS)[number]["value"];
type IllustrationCount = (typeof IMAGE_COUNT_OPTIONS)[number];

type IllustrationErrorMap = Record<number, string>;

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "repo";
}

function getAspectClass(layout: IllustrationLayout): string {
  if (layout === "portrait") return "aspect-[2/3]";
  if (layout === "square") return "aspect-square";
  return "aspect-[3/2]";
}

async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Image introuvable");

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

const RepoDetail = () => {
  const { owner, repo: repoName } = useParams();
  const navigate = useNavigate();
  const { aiModel, githubToken, addTokens, favorites } = useStore();

  const [repoData, setRepoData] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState("");
  const [aiDetail, setAiDetail] = useState<{
    description: string;
    useCases: string;
    compatibleStack: string;
    strengths: string;
    similar: string[];
  } | null>(null);
  const [aiError, setAiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [illustrationLoading, setIllustrationLoading] = useState(false);
  const [illustrationError, setIllustrationError] = useState("");
  const [illustrationPlan, setIllustrationPlan] = useState<{ title: string; style: string; imageCount: number; characterDescription?: string } | null>(null);
  const [illustrations, setIllustrations] = useState<string[]>([]);
  const [illustrationErrors, setIllustrationErrors] = useState<IllustrationErrorMap>({});
  const [illustrationLayout, setIllustrationLayout] = useState<IllustrationLayout>("landscape");
  const [illustrationMaxImages, setIllustrationMaxImages] = useState<IllustrationCount>(6);

  const isSaved = favorites.some((f) => f.full_name === `${owner}/${repoName}`);
  const aiEnabled = true;
  const illustrationReadyCount = illustrations.filter(Boolean).length;
  const illustrationTotalCount = illustrationPlan?.imageCount || illustrations.length;

  useEffect(() => {
    if (!owner || !repoName) return;
    setLoading(true);
    setAiDetail(null);
    setAiError("");
    setIllustrationPlan(null);
    setIllustrations([]);
    setIllustrationErrors({});
    setIllustrationError("");

    Promise.all([getRepoDetails(owner, repoName, githubToken || undefined), getRepoReadme(owner, repoName, githubToken || undefined)])
      .then(([data, rm]) => {
        setRepoData(data);
        setReadme(rm);
        setLoading(false);

        if (aiEnabled) {
          setAiLoading(true);
          generateRepoDetail(undefined, aiModel, {
            full_name: data.full_name,
            description: data.description,
            readme: rm,
          })
            .then(({ detail, tokens }) => {
              setAiDetail(detail);
              setAiError("");
              addTokens(tokens);
            })
            .catch((error) => {
              console.error(error);
              setAiError("Impossible de charger l'analyse IA du repository.");
            })
            .finally(() => setAiLoading(false));
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [owner, repoName, githubToken, aiModel, aiEnabled, addTokens]);

  const handleIllustrateRepo = async () => {
    if (!repoData) return;

    setIllustrationLoading(true);
    setIllustrationError("");
    setIllustrations([]);
    setIllustrationErrors({});
    setIllustrationPlan(null);

    try {
      const { plan, images, tokens } = await generateRepoIllustrations(
        undefined,
        {
          full_name: repoData.full_name,
          description: repoData.description,
          readme,
          topics: repoData.topics || [],
          stargazers_count: repoData.stargazers_count,
          forks_count: repoData.forks_count,
        },
        aiDetail || undefined,
        {
          layout: illustrationLayout,
          maxImages: illustrationMaxImages,
          quality: "medium",
          concurrency: 1,
          onImageGenerated: (index, url) => {
            setIllustrations((prev) => {
              const next = [...prev];
              while (next.length <= index) next.push("");
              next[index] = url;
              return next;
            });
            setIllustrationErrors((prev) => {
              if (!(index in prev)) return prev;
              const next = { ...prev };
              delete next[index];
              return next;
            });
          },
          onImageError: (index, error) => {
            setIllustrations((prev) => {
              const next = [...prev];
              while (next.length <= index) next.push("");
              next[index] = "";
              return next;
            });
            setIllustrationErrors((prev) => ({ ...prev, [index]: error.message || "Erreur de generation" }));
          },
        }
      );

      setIllustrationPlan(plan);
      setIllustrations(images);
      if (tokens > 0) addTokens(tokens);
    } catch (error) {
      console.error(error);
      setIllustrationError("Impossible de generer les illustrations pour ce repository.");
    } finally {
      setIllustrationLoading(false);
    }
  };

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

  const repoSlug = slugify(repoData.full_name);

  return (
    <div className="container px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-all text-xl font-bold text-foreground sm:text-2xl">{repoData.full_name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{repoData.description}</p>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
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
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-label text-primary-foreground transition-colors hover:bg-primary/90 sm:flex-none"
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
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-label text-primary transition-colors hover:bg-primary/20"
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

        {aiError && !aiLoading && !aiDetail && (
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
            {aiError}
          </div>
        )}

        {aiDetail && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-primary/20 bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="flex items-center gap-2 font-label text-sm font-medium text-primary">
                  <Zap className="h-4 w-4" />
                  Analyse IA
                </h2>
                <Button onClick={handleIllustrateRepo} disabled={illustrationLoading} size="sm" className="inline-flex gap-2 self-start">
                  {illustrationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  Illustrer ce repository
                </Button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground">{aiDetail.description}</p>
              {aiDetail.useCases && (
                <div className="mt-3">
                  <h3 className="font-label text-xs uppercase text-muted-foreground">Cas d'usage</h3>
                  <p className="mt-1 text-sm text-foreground">{aiDetail.useCases}</p>
                </div>
              )}
              {aiDetail.compatibleStack && (
                <div className="mt-3">
                  <h3 className="font-label text-xs uppercase text-muted-foreground">Stack compatible</h3>
                  <p className="mt-1 text-sm text-foreground">{aiDetail.compatibleStack}</p>
                </div>
              )}
              {aiDetail.strengths && (
                <div className="mt-3">
                  <h3 className="font-label text-xs uppercase text-muted-foreground">Points forts</h3>
                  <p className="mt-1 text-sm text-foreground">{aiDetail.strengths}</p>
                </div>
              )}

              <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-label text-xs uppercase tracking-wider text-muted-foreground">Parametres illustration</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      GPT-5.4 Pro prepare le brief, GPT Image 2 genere le carrousel en 8K ultra.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LAYOUT_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={illustrationLayout === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIllustrationLayout(option.value)}
                        className="h-8 gap-1.5"
                      >
                        {option.label}
                        <span className="text-[10px] opacity-70">{option.hint}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {IMAGE_COUNT_OPTIONS.map((count) => (
                    <Button
                      key={count}
                      type="button"
                      variant={illustrationMaxImages === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIllustrationMaxImages(count)}
                      className="h-8 w-10 px-0"
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {illustrationLoading && (
              <div className="rounded-xl border border-primary/20 bg-card p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="font-label text-xs">Generation des illustrations GPT Image 2 en file d'attente...</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {illustrationReadyCount}/{illustrationTotalCount || illustrationMaxImages} images pretes
                </p>
              </div>
            )}

            {illustrationError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {illustrationError}
              </div>
            )}

            {illustrations.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-label text-sm font-medium text-foreground">Illustrations IA</h3>
                    <p className="text-xs text-muted-foreground">
                      {illustrationPlan?.title || repoData.full_name} · {illustrationPlan?.style || `${illustrationLayout} 8K ultra`}
                    </p>
                    {illustrationPlan?.characterDescription && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Personnage 3D: {illustrationPlan.characterDescription}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-label text-primary">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {illustrationReadyCount}/{illustrationTotalCount || illustrationMaxImages}
                  </span>
                </div>

                <Carousel className="w-full">
                  <CarouselContent>
                    {illustrations.map((src, index) => {
                      const error = illustrationErrors[index];
                      const totalSlides = illustrationTotalCount || illustrations.length || 1;
                      return (
                        <CarouselItem key={`${index}-${src || "pending"}`} className="basis-full">
                          <div className="overflow-hidden rounded-2xl border border-border bg-background">
                            <div className={`relative ${getAspectClass(illustrationLayout)} w-full overflow-hidden`}>
                              {src ? (
                                <img
                                  src={src}
                                  alt={`${repoData.full_name} illustration ${index + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : error ? (
                                <div className="flex h-full w-full items-center justify-center bg-destructive/5 p-6 text-center text-sm text-destructive">
                                  <div>
                                    <p className="font-semibold">Generation en erreur</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                                  <div className="space-y-2">
                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                                    <p>Image en cours de generation...</p>
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-3">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                    Slide {index + 1} / {totalSlides}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {src ? "Carrousel GPT Image 2" : error ? "Erreur de generation" : "En attente"}
                                  </p>
                                </div>
                                {src && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 gap-1.5"
                                    onClick={() => downloadImage(src, `${repoSlug}-slide-${index + 1}.png`)}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Télécharger
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  {illustrations.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </div>
            )}

            {aiDetail.similar && aiDetail.similar.length > 0 && (
              <div>
                <h3 className="mb-2 font-label text-xs uppercase text-muted-foreground">Repos similaires</h3>
                <div className="flex flex-wrap gap-2">
                  {aiDetail.similar.map((s) => (
                    <button
                      key={s}
                      onClick={() => navigate(`/results?q=${encodeURIComponent(s)}`)}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
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
            <h2 className="mb-3 font-label text-sm font-medium uppercase text-muted-foreground">README</h2>
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
      <span className="block truncate text-sm font-semibold text-foreground">{value}</span>
      <span className="block text-[11px] text-muted-foreground">{label}</span>
    </div>
  </div>
);

export default RepoDetail;
