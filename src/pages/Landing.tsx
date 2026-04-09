import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Search, BookmarkIcon, Globe } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-base font-bold text-primary-foreground">V</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">Vaultify</span>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="rounded-lg bg-primary px-4 py-2 font-label text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
        >
          Commencer
        </button>
      </nav>

      {/* Hero */}
      <section className="container pb-20 pt-16 text-center md:pt-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-warning" />
            <span className="font-label text-xs text-muted-foreground">
              Propulsé par IA · Gratuit · Open Source
            </span>
          </div>

          <h1 className="font-display text-4xl font-black leading-tight text-foreground sm:text-5xl md:text-6xl">
            Découvrez les{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              pépites GitHub
            </span>{" "}
            que personne ne connaît
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Décrivez votre besoin en langage naturel. L'IA fouille GitHub en profondeur,
            score et résume les meilleurs repos pour vous.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-label text-base font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-150 hover:gap-3"
          >
            Commencer à explorer
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Features */}
        <div className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Search className="h-5 w-5 text-primary" />}
            title="Recherche intelligente"
            desc="Décrivez votre besoin, l'IA traduit en requêtes GitHub optimisées"
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5 text-warning" />}
            title="Scoring & résumés IA"
            desc="Chaque repo est évalué et résumé automatiquement par Groq"
          />
          <FeatureCard
            icon={<BookmarkIcon className="h-5 w-5 text-accent" />}
            title="Collections & favoris"
            desc="Organisez vos découvertes en collections partageables"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <span>Vaultify — Communauté tech francophone africaine</span>
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>Gratuit · Sans pub</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="rounded-xl border border-border bg-card p-5 text-left card-hover">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
  </div>
);

export default Landing;
