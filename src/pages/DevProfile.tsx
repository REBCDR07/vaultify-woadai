import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { getUserDetails, getUserRepos, type GitHubUser, type GitHubRepo } from "@/lib/github";
import { analyzeDevProfile } from "@/lib/ai";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Building,
  Globe,
  Users,
  Star,
  GitFork,
  Zap,
  Loader2,
  Code,
  Calendar,
  Trophy,
  Lightbulb,
  Briefcase,
} from "lucide-react";

interface AiProfile {
  summary: string;
  expertise: string;
  collaborationFit: string;
  projectSuggestions: string;
  ranking: string;
}

const DevProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { githubToken, aiModel, lewisApiKey, addTokens } = useStore();

  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiProfile, setAiProfile] = useState<AiProfile | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const aiEnabled = true;

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    Promise.all([
      getUserDetails(username, githubToken || undefined),
      getUserRepos(username, githubToken || undefined),
    ])
      .then(([userData, repoData]) => {
        setUser(userData);
        const sorted = repoData.sort((a, b) => b.stargazers_count - a.stargazers_count);
        setRepos(sorted);
        setLoading(false);

        if (aiEnabled) {
          setAiLoading(true);
          analyzeDevProfile(lewisApiKey, aiModel, userData, sorted.slice(0, 15))
            .then(({ profile, tokens }) => {
              setAiProfile(profile);
              addTokens(tokens);
            })
            .catch(console.error)
            .finally(() => setAiLoading(false));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username, githubToken, aiModel, aiEnabled, addTokens]);

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3 py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-body">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container px-4 py-12 text-center text-muted-foreground">
        Profil non trouvé
      </div>
    );
  }

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))];
  const joinDate = new Date(user.created_at || "").toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

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

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-primary/30"
            />
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-xl sm:text-2xl font-heading text-foreground">{user.name || user.login}</h1>
              <p className="text-sm text-muted-foreground font-body">@{user.login}</p>

              {user.bio && <p className="mt-2 text-sm text-foreground/80 font-body">{user.bio}</p>}

              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-body">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {user.location}
                  </span>
                )}
                {user.company && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" /> {user.company}
                  </span>
                )}
                {user.blog && (
                  <a
                    href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3 w-3" /> Site web
                  </a>
                )}
                {joinDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Depuis {joinDate}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-label text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Voir sur GitHub <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <StatBadge icon={<Users className="h-3.5 w-3.5 text-primary" />} value={user.followers} label="Followers" />
            <StatBadge icon={<Users className="h-3.5 w-3.5 text-muted-foreground" />} value={user.following} label="Following" />
            <StatBadge icon={<Code className="h-3.5 w-3.5 text-accent" />} value={user.public_repos} label="Repos" />
            <StatBadge icon={<Star className="h-3.5 w-3.5 text-warning" />} value={totalStars} label="Stars total" />
            <StatBadge icon={<GitFork className="h-3.5 w-3.5 text-primary" />} value={totalForks} label="Forks total" />
          </div>

          {languages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {languages.slice(0, 10).map((lang) => (
                <span key={lang} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-label text-primary">
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>

        {aiLoading && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-pulse">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4 animate-pulse-glow" />
              <span className="font-label text-xs">Analyse IA du profil en cours...</span>
            </div>
          </div>
        )}

        {aiProfile && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-card p-4 sm:p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-label text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              Analyse IA du profil
            </h2>

            <div>
              <p className="text-sm leading-relaxed text-foreground font-body">{aiProfile.summary}</p>
            </div>

            {aiProfile.expertise && (
              <div>
                <h3 className="flex items-center gap-1.5 font-label text-xs text-muted-foreground uppercase mb-1">
                  <Trophy className="h-3 w-3 text-warning" /> Expertise
                </h3>
                <p className="text-sm text-foreground/90 font-body">{aiProfile.expertise}</p>
              </div>
            )}

            {aiProfile.collaborationFit && (
              <div>
                <h3 className="flex items-center gap-1.5 font-label text-xs text-muted-foreground uppercase mb-1">
                  <Briefcase className="h-3 w-3 text-accent" /> Collaboration
                </h3>
                <p className="text-sm text-foreground/90 font-body">{aiProfile.collaborationFit}</p>
              </div>
            )}

            {aiProfile.projectSuggestions && (
              <div>
                <h3 className="flex items-center gap-1.5 font-label text-xs text-muted-foreground uppercase mb-1">
                  <Lightbulb className="h-3 w-3 text-warning" /> Projets recommandés
                </h3>
                <p className="text-sm text-foreground/90 font-body">{aiProfile.projectSuggestions}</p>
              </div>
            )}

            {aiProfile.ranking && (
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <h3 className="font-label text-xs text-primary uppercase mb-1">Classement</h3>
                <p className="text-sm text-foreground font-body">{aiProfile.ranking}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h2 className="mb-3 font-label text-sm font-medium text-muted-foreground uppercase">
            Repositories populaires ({repos.length})
          </h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {repos.slice(0, 12).map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/repo/${r.full_name}`)}
                className="rounded-xl border border-border bg-card p-3 text-left card-hover animate-slide-up"
              >
                <h3 className="text-sm font-heading text-foreground truncate hover:text-primary transition-colors">{r.name}</h3>
                {r.description && <p className="mt-1 text-xs text-muted-foreground font-body line-clamp-2">{r.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-warning" />
                    {r.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {r.forks_count}
                  </span>
                  {r.language && <span className="rounded-full bg-secondary px-2 py-0.5 font-label text-secondary-foreground">{r.language}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
    {icon}
    <div className="min-w-0">
      <span className="block text-sm font-semibold text-foreground">{value.toLocaleString()}</span>
      <span className="block text-[10px] text-muted-foreground truncate">{label}</span>
    </div>
  </div>
);

export default DevProfile;
