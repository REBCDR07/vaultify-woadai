import { useState } from "react";
import { X } from "lucide-react";
import { useStore, type Collection } from "@/store/useStore";

interface SaveModalProps {
  open: boolean;
  onClose: () => void;
  repoData: {
    full_name: string;
    html_url: string;
    stars: number;
    language: string;
    topics: string[];
    summary: string;
  };
}

const SaveModal = ({ open, onClose, repoData }: SaveModalProps) => {
  const { collections, addCollection, addFavorite } = useStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newName, setNewName] = useState("");

  if (!open) return null;

  const handleCreateCollection = () => {
    if (!newName.trim()) return;
    const col: Collection = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: "",
      is_public: false,
      slug: newName.trim().toLowerCase().replace(/\s+/g, "-"),
      created_at: new Date().toISOString(),
    };
    addCollection(col);
    setSelectedIds((prev) => [...prev, col.id]);
    setNewName("");
  };

  const handleSave = () => {
    addFavorite({
      id: crypto.randomUUID(),
      full_name: repoData.full_name,
      html_url: repoData.html_url,
      stars: repoData.stars,
      language: repoData.language,
      topics: repoData.topics,
      ai_summary: repoData.summary,
      personal_note: "",
      tags: [],
      saved_at: new Date().toISOString(),
      collection_ids: selectedIds,
    });
    onClose();
  };

  const toggleId = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-display text-lg font-bold text-foreground">Sauvegarder</h3>
        <p className="mt-1 text-xs text-muted-foreground">{repoData.full_name}</p>

        {collections.length > 0 && (
          <div className="mt-4 max-h-40 space-y-1.5 overflow-y-auto">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => toggleId(col.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedIds.includes(col.id)
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouvelle collection..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
          />
          <button
            onClick={handleCreateCollection}
            disabled={!newName.trim()}
            className="rounded-lg bg-secondary px-3 py-2 text-sm font-label text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
          >
            +
          </button>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-label font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

export default SaveModal;
