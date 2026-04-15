import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Search, Trash2, FolderOpen, Download } from "lucide-react";
import RepoCard from "@/components/results/RepoCard";

const Favorites = () => {
  const { favorites, collections, removeFavorite, removeCollection } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const filtered = favorites.filter((f) => {
    const matchesSearch =
      !searchTerm ||
      f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ai_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCollection =
      !selectedCollection || f.collection_ids.includes(selectedCollection);
    return matchesSearch && matchesCollection;
  });

  const exportFavorites = (format: "json" | "markdown") => {
    const data = selectedCollection ? filtered : favorites;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      downloadBlob(blob, "vaultify-favorites.json");
    } else {
      const md = data
        .map(
          (f) =>
            `## [${f.full_name}](${f.html_url})\n⭐ ${f.stars} · ${f.language}\n\n${f.ai_summary}\n\n${f.personal_note ? `> ${f.personal_note}\n` : ""}---\n`
        )
        .join("\n");
      const blob = new Blob([md], { type: "text/markdown" });
      downloadBlob(blob, "vaultify-favorites.md");
    }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Mes Favoris</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportFavorites("json")}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-label text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </button>
          <button
            onClick={() => exportFavorites("markdown")}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-label text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            MD
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Chercher dans mes favoris..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {collections.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCollection(null)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-label transition-colors ${
              !selectedCollection
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous ({favorites.length})
          </button>
          {collections.map((col) => {
            const count = favorites.filter((f) => f.collection_ids.includes(col.id)).length;
            return (
              <div key={col.id} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedCollection(col.id)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-label transition-colors ${
                    selectedCollection === col.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FolderOpen className="h-3 w-3" />
                  {col.name} ({count})
                </button>
                <button
                  onClick={() => removeCollection(col.id)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {favorites.length === 0
              ? "Aucun favori sauvegardé. Lancez une recherche et sauvegardez des repos !"
              : "Aucun favori ne correspond à vos filtres."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
          {filtered.map((f) => (
            <div key={f.id} className="relative">
              <RepoCard
                full_name={f.full_name}
                html_url={f.html_url}
                stars={f.stars}
                language={f.language}
                topics={f.topics}
                updated_at={f.saved_at}
                summary={f.ai_summary}
                isSaved
                onSave={() => removeFavorite(f.full_name)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
