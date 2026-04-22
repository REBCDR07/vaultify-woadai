import SearchBar from "@/components/search/SearchBar";
import CategoryGrid from "@/components/search/CategoryGrid";
import { useStore } from "@/store/useStore";
import { Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { searchHistory } = useStore();
  const navigate = useNavigate();

  const recentSearches = searchHistory.slice(0, 5);

  return (
    <div className="container px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Que cherchez-vous ?</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">L'IA analyse, score et résume les meilleurs repositories pour vous.</p>
        <div className="mt-4 sm:mt-6">
          <SearchBar large />
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="mx-auto mt-6 sm:mt-8 max-w-2xl">
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

      <div className="mx-auto mt-8 sm:mt-10 max-w-3xl">
        <h2 className="mb-4 font-label text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Explorer par catégorie
        </h2>
        <CategoryGrid />
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center text-[11px] text-muted-foreground">
        IA prête à l'emploi. Aucun paramétrage de clé requis. Configurez uniquement votre token GitHub pour augmenter vos quotas API.
      </p>
    </div>
  );
};

export default Home;
