import { useState } from "react";
import { useStore } from "@/store/useStore";
import { AI_MODELS } from "@/lib/constants";
import { Eye, EyeOff, ExternalLink, Trash2, Zap, Download, Github } from "lucide-react";

const Settings = () => {
  const { aiModel, totalTokensUsed, githubToken, setAiModel, setGithubToken, favorites, searchHistory, clearSearchHistory } = useStore();

  const [ghToken, setGhToken] = useState(githubToken);
  const [showGhToken, setShowGhToken] = useState(false);
  const [ghSaved, setGhSaved] = useState(false);

  const selectedModel = AI_MODELS.find((m) => m.id === aiModel) || AI_MODELS[0];

  const handleSaveGhToken = () => {
    setGithubToken(ghToken.trim());
    setGhSaved(true);
    setTimeout(() => setGhSaved(false), 2000);
  };

  const handleExportAll = () => {
    const data = { favorites, searchHistory, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vaultify-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = () => {
    if (!confirm("Supprimer toutes vos données ? Cette action est irréversible.")) return;
    localStorage.removeItem("vaultify-storage");
    window.location.reload();
  };

  return (
    <div className="container px-4 py-6">
      <div className="mx-auto max-w-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Paramètres</h1>

        <section className="mt-6 sm:mt-8">
          <h2 className="flex items-center gap-2 font-label text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Zap className="h-4 w-4 text-primary" />
            Modèles IA
          </h2>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
              <p>
                Routage: <span className="text-foreground">proxies natifs du déploiement</span>
              </p>
              <p className="mt-1">
                État: <span className="text-primary">actif</span>
              </p>
              <p className="mt-1">
                Aucun secret n'est saisi par l'utilisateur, les modèles et endpoints sont injectés au déploiement.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block font-label text-xs text-muted-foreground">Modèle IA</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.speed} · {m.badge}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {selectedModel.description}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs text-muted-foreground">Tokens consommés</span>
                <span className="text-sm font-semibold text-foreground">{totalTokensUsed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 sm:mt-10">
          <h2 className="flex items-center gap-2 font-label text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Github className="h-4 w-4 text-foreground" />
            Token GitHub
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">Augmente la limite de 60 à 5000 requêtes/heure.</p>

          <div className="mt-4">
            <label className="mb-1.5 block font-label text-xs text-muted-foreground">Personal Access Token</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type={showGhToken ? "text" : "password"}
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => setShowGhToken(!showGhToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showGhToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleSaveGhToken}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-label text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {ghSaved ? "✓" : "Sauver"}
              </button>
            </div>
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Créer un token GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>

        <section className="mt-8 sm:mt-10">
          <h2 className="font-label text-sm font-medium text-muted-foreground uppercase tracking-wider">Données</h2>

          <div className="mt-4 space-y-3">
            <button
              onClick={handleExportAll}
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Download className="h-4 w-4 text-primary" />
              Exporter toutes mes données
            </button>
            <button
              onClick={clearSearchHistory}
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              Effacer l'historique
            </button>
            <button
              onClick={handleDeleteAll}
              className="flex w-full items-center gap-2 rounded-lg border border-destructive/50 bg-card px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer toutes mes données
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
