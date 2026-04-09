import { useState } from "react";
import { useStore } from "@/store/useStore";
import { GROQ_MODELS } from "@/lib/constants";
import { Eye, EyeOff, ExternalLink, X } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ open, onClose }: OnboardingModalProps) => {
  const { groqApiKey, groqModel, setGroqApiKey, setGroqModel, setOnboardingDone } = useStore();
  const [step, setStep] = useState(1);
  const [key, setKey] = useState(groqApiKey);
  const [model, setModel] = useState(groqModel);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleNext = () => {
    if (!key.startsWith("gsk_")) {
      setError("La clé doit commencer par gsk_");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFinish = () => {
    setGroqApiKey(key);
    setGroqModel(model);
    setOnboardingDone(true);
    onClose();
  };

  const handleSkip = () => {
    setOnboardingDone(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-slide-up">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
        </div>

        {step === 1 ? (
          <>
            <h2 className="font-display text-xl font-bold text-foreground">
              Configurer l'IA
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez votre clé API Groq pour activer les résumés intelligents et le scoring IA.
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block font-label text-xs text-muted-foreground">
                Clé API Groq
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>

            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Obtenir ma clé gratuite sur console.groq.com
              <ExternalLink className="h-3 w-3" />
            </a>

            <div className="mt-4">
              <label className="mb-1.5 block font-label text-xs text-muted-foreground">
                Modèle par défaut
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {GROQ_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.speed}) — {m.badge}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSkip}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-label text-muted-foreground hover:text-foreground transition-colors"
              >
                Passer
              </button>
              <button
                onClick={handleNext}
                disabled={!key}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-label font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold text-foreground">
              Tout est prêt !
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre clé API est configurée. Elle est stockée localement dans votre navigateur
              et ne sera jamais partagée.
            </p>

            <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3">
              <p className="text-xs text-accent">
                ✓ Clé API configurée
              </p>
              <p className="mt-1 text-xs text-accent">
                ✓ Modèle : {GROQ_MODELS.find((m) => m.id === model)?.name}
              </p>
              <p className="mt-1 text-xs text-accent">
                ✓ Stockage local sécurisé
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-label font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Commencer à explorer
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
