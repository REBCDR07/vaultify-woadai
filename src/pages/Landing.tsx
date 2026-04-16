import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Zap, BookmarkIcon, Users, Globe, Star, Code, Sparkles } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="container px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
            <span className="font-display text-sm text-background">V</span>
          </div>
          <span className="font-display text-xl text-foreground">Vaultify</span>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="rounded-lg bg-foreground px-4 py-2 font-label text-sm text-background hover:bg-foreground/90 transition-colors"
        >
          Commencer
        </button>
      </nav>

      {/* Hero */}
      <section className="container px-4 pt-16 sm:pt-24 md:pt-32 pb-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span className="font-label text-xs text-muted-foreground">
              Propulsé par IA · 100% Gratuit · Open Source
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-foreground">
            Trouvez les repos
            <br />
            <span className="text-muted-foreground">que personne</span>
            <br />
            ne connaît
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground font-body leading-relaxed">
            Décrivez votre besoin. L'IA fouille GitHub en profondeur,
            score et résume les meilleurs repositories pour vous.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-3.5 font-label text-base text-background hover:bg-foreground/90 transition-all duration-200 hover:gap-3"
            >
              Explorer maintenant
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/devs-benin")}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-label text-sm text-foreground hover:bg-card transition-colors"
            >
              <Users className="h-4 w-4" />
              Devs Béninois 🇧🇯
            </button>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Pour qui ?</h2>
            <p className="mt-3 text-muted-foreground font-body">
              Vaultify est conçu pour toute personne qui cherche des outils et des ressources sur GitHub.
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid gap-4 grid-cols-1 sm:grid-cols-3">
            <AudienceCard
              icon={<Code className="h-6 w-6" />}
              title="Développeurs"
              desc="Trouvez des librairies, frameworks et outils adaptés à vos projets en secondes."
            />
            <AudienceCard
              icon={<Star className="h-6 w-6" />}
              title="Designers"
              desc="Découvrez des systèmes de design, icon packs et ressources UI open source."
            />
            <AudienceCard
              icon={<Users className="h-6 w-6" />}
              title="Étudiants & Curieux"
              desc="Apprenez en explorant les meilleurs projets open source de la communauté."
            />
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="border-t border-border py-16 sm:py-24 bg-card">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Comment ça marche</h2>
          </div>

          <div className="mx-auto max-w-4xl grid gap-6 grid-cols-1 sm:grid-cols-3">
            <StepCard number="01" title="Décrivez" desc="Tapez votre besoin en langage naturel. Pas besoin de connaître la syntaxe GitHub." />
            <StepCard number="02" title="L'IA analyse" desc="Groq traduit votre requête, fouille GitHub et score chaque repo trouvé." />
            <StepCard number="03" title="Découvrez" desc="Recevez des résultats scorés, résumés et prêts à être explorés ou sauvegardés." />
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Fonctionnalités</h2>
          </div>

          <div className="mx-auto max-w-5xl grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<Search className="h-5 w-5" />} title="Recherche IA" desc="Requêtes optimisées automatiquement par l'IA" />
            <FeatureCard icon={<Zap className="h-5 w-5" />} title="Scoring intelligent" desc="Chaque repo est évalué et résumé par Groq" />
            <FeatureCard icon={<BookmarkIcon className="h-5 w-5" />} title="Collections" desc="Sauvegardez et organisez vos découvertes" />
            <FeatureCard icon={<Users className="h-5 w-5" />} title="Devs Béninois" desc="Annuaire IA des talents tech du Bénin" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 sm:py-24 bg-card">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">
            Prêt à explorer ?
          </h2>
          <p className="mt-3 text-muted-foreground font-body">
            Gratuit, sans inscription, sans pub.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-3.5 font-label text-base text-background hover:bg-foreground/90 transition-all duration-200"
          >
            Commencer maintenant
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-body">
          <span className="font-display text-sm text-foreground">Vaultify</span>
          <span>Communauté tech francophone africaine</span>
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>Gratuit · Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AudienceCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="rounded-xl border border-border bg-card p-6 text-center card-hover">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground">
      {icon}
    </div>
    <h3 className="font-label text-base text-foreground">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground font-body">{desc}</p>
  </div>
);

const StepCard = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="text-center">
    <span className="font-display text-4xl text-muted-foreground/30">{number}</span>
    <h3 className="mt-2 font-label text-lg text-foreground">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground font-body">{desc}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="rounded-xl border border-border bg-card p-5 card-hover">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
      {icon}
    </div>
    <h3 className="font-label text-sm text-foreground">{title}</h3>
    <p className="mt-1 text-xs text-muted-foreground font-body">{desc}</p>
  </div>
);

export default Landing;
