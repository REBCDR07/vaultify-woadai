import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { ExternalLink, Star, Copy, Check, FolderOpen } from "lucide-react";
import { useState } from "react";

const PublicCollection = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { collections, favorites, addFavorite, addCollection } = useStore();
  const [copied, setCopied] = useState(false);

  const collection = collections.find((c) => c.slug === slug && c.is_public);

  if (!collection) {
    return (
      <div className="container py-12 text-center">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Collection introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette collection n'existe pas ou n'est pas publique.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-label text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const repos = favorites.filter((f) => f.collection_ids.includes(collection.id));

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCollection = () => {
    const exists = collections.find((c) => c.slug === collection.slug && c.id !== collection.id);
    if (!exists) {
      const newCol = { ...collection, id: crypto.randomUUID(), is_public: false };
      addCollection(newCol);
      repos.forEach((r) => {
        addFavorite({ ...r, id: crypto.randomUUID(), collection_ids: [newCol.id] });
      });
    }
  };

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{collection.name}</h1>
            {collection.description && (
              <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{repos.length} repositories</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-label text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copié !" : "Partager"}
            </button>
            <button
              onClick={handleSaveCollection}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-label text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>

        {repos.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground">
            Cette collection est vide.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="rounded-xl border border-border bg-card p-4 card-hover cursor-pointer"
                onClick={() => {
                  const [owner, name] = repo.full_name.split("/");
                  navigate(`/repo/${owner}/${name}`);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">{repo.full_name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{repo.ai_summary}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-warning" />
                        {repo.stars.toLocaleString()}
                      </span>
                      {repo.language && <span>{repo.language}</span>}
                    </div>
                    {repo.topics.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {repo.topics.slice(0, 5).map((t) => (
                          <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCollection;
