import { Star, ExternalLink, Bookmark, Clock, Lightbulb, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RepoCardProps {
  full_name: string;
  html_url: string;
  stars: number;
  language: string;
  topics: string[];
  updated_at: string;
  license?: string;
  score?: number;
  summary?: string;
  useCases?: string;
  strengths?: string;
  onSave?: () => void;
  isSaved?: boolean;
}

const RepoCard = ({
  full_name,
  html_url,
  stars,
  language,
  topics,
  updated_at,
  license,
  score,
  summary,
  useCases,
  strengths,
  onSave,
  isSaved,
}: RepoCardProps) => {
  const navigate = useNavigate();
  const [owner, repo] = full_name.split("/");
  const updatedDate = new Date(updated_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group rounded-xl border border-border bg-card p-4 card-hover animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => navigate(`/repo/${owner}/${repo}`)}
          className="text-left"
        >
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
            {full_name}
          </h3>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {onSave && (
            <button
              onClick={onSave}
              className={`rounded-md p-1.5 transition-colors duration-150 ${
                isSaved
                  ? "text-warning bg-warning/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {score !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${score}%`,
                background:
                  score > 75
                    ? "hsl(var(--accent))"
                    : score > 50
                    ? "hsl(var(--primary))"
                    : "hsl(var(--warning))",
              }}
            />
          </div>
          <span className="font-label text-xs text-muted-foreground">{score}%</span>
        </div>
      )}

      {summary && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-4">
          {summary}
        </p>
      )}

      {useCases && (
        <div className="mt-2 flex items-start gap-1.5">
          <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-warning" />
          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
            <span className="font-label text-foreground/70">Cas d'usage : </span>
            {useCases}
          </p>
        </div>
      )}

      {strengths && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <Trophy className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
            <span className="font-label text-foreground/70">Points forts : </span>
            {strengths}
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 text-warning" />
          {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
        </span>
        {language && (
          <span className="rounded-full bg-secondary px-2 py-0.5 font-label text-secondary-foreground">
            {language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {updatedDate}
        </span>
        {license && (
          <span className="rounded-full border border-border px-2 py-0.5">{license}</span>
        )}
      </div>

      {topics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {topics.slice(0, 5).map((topic) => (
            <button
              key={topic}
              onClick={() => navigate(`/results?q=${encodeURIComponent(topic)}`)}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-label text-primary hover:bg-primary/20 transition-colors duration-150"
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepoCard;
