import { useState, useEffect } from "react";
import SearchBar from "@/components/search/SearchBar";
import CategoryGrid from "@/components/search/CategoryGrid";
import OnboardingModal from "@/components/search/OnboardingModal";
import { useStore } from "@/store/useStore";
import { Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { groqApiKey, onboardingDone, searchHistory } = useStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!groqApiKey && !onboardingDone) {
      setShowOnboarding(true);
    }
  }, [groqApiKey, onboardingDone]);

  const recentSearches = searchHistory.slice(0, 5);

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Que cherchez-vous ?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {groqApiKey
            ? "L'IA va analyser et scorer les meilleurs repos pour vous"
            : "Mode basique — ajoutez votre clé Groq dans les paramètres pour activer l'IA"}
        </p>
        <div className="mt-6">
          <SearchBar large />
        </div>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="mx-auto mt-8 max-w-2xl">
          <h2 className="mb-3 flex items-center gap-2 font-label text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            Recherches récentes
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/results?q=${encodeURIComponent(s.query)}`)}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors duration-150"
              >
                {s.query}
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mx-auto mt-10 max-w-3xl">
        <h2 className="mb-4 font-label text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Explorer par catégorie
        </h2>
        <CategoryGrid />
      </div>

      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
};

export default Home;
