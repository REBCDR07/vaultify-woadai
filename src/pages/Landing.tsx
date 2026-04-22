import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Zap,
  BookmarkIcon,
  Users,
  Globe,
  Star,
  Code,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Gauge,
  FolderTree,
  Brain,
} from "lucide-react";

const FAQS = [
  {
    q: "Vaultify est-il gratuit ?",
    a: "Oui. L'application est gratuite, et vous pouvez l'utiliser sans inscription.",
  },
  {
    q: "Faut-il une clé API pour utiliser Vaultify ?",
    a: "Non. Les fonctionnalités IA sont déjà préconfigurées dans l'application. Seul un token GitHub est optionnel pour augmenter les quotas API.",
  },
  {
    q: "Mes favoris sont-ils stockés en ligne ?",
    a: "Non. Les favoris, l'historique et les collections sont stockés localement dans votre navigateur.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
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

      <header className="container px-4 pt-14 sm:pt-20 md:pt-24 pb-14 sm:pb-18">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span className="font-label text-xs text-muted-foreground">
              IA + GitHub Search • Gratuit • Open Source
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-foreground">
            Identifiez les meilleurs
            <br />
            repositories GitHub
            <br />
            <span className="text-muted-foreground">plus vite</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-muted-foreground font-body leading-relaxed">
            Vaultify transforme une intention en résultats concrets: recherche parallèle,
            scoring IA, résumés actionnables, cas d'usage et collections organisées.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-3.5 font-label text-base text-background hover:bg-foreground/90 transition-all duration-200 hover:gap-3"
            >
              Lancer une recherche
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/devs-benin")}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-label text-sm text-foreground hover:bg-card transition-colors"
            >
              <Users className="h-4 w-4" />
              Explorer les Devs Béninois
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <KpiCard value="3x" label="requêtes générées par l'IA" />
            <KpiCard value="30 min" label="cache local intelligent" />
            <KpiCard value="0€" label="coût d'accès à l'app" />
          </div>
        </div>
      </header>

      <section className="border-y border-border bg-card/40 py-12 sm:py-16">
        <div className="container px-4">
          <div className="mx-auto grid max-w-5xl gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <ReasonCard
              icon={<Gauge className="h-5 w-5" />}
              title="Décision plus rapide"
              desc="Passez d'une recherche brute à un top priorisé en quelques secondes."
            />
            <ReasonCard
              icon={<Brain className="h-5 w-5" />}
              title="Contexte exploitable"
              desc="Chaque repo est résumé avec cas d'usage et points forts."
            />
            <ReasonCard
              icon={<FolderTree className="h-5 w-5" />}
              title="Organisation native"
              desc="Créez des collections, ajoutez des notes et exportez en JSON/MD."
            />
            <ReasonCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Local-first"
              desc="Vos données restent dans votre navigateur, sans dépendance backend."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Pour qui ?</h2>
            <p className="mt-3 text-muted-foreground font-body">
              Vaultify s'adresse aux profils qui veulent sélectionner les bons projets open source sans perdre de temps.
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid gap-4 grid-cols-1 sm:grid-cols-3">
            <AudienceCard
              icon={<Code className="h-6 w-6" />}
              title="Développeurs"
              desc="Trouvez des librairies, frameworks et outils adaptés à vos contraintes techniques."
            />
            <AudienceCard
              icon={<Star className="h-6 w-6" />}
              title="Designers produit"
              desc="Repérez des UI kits, systèmes de design et ressources frontend pertinentes."
            />
            <AudienceCard
              icon={<Users className="h-6 w-6" />}
              title="Étudiants & équipes"
              desc="Construisez une veille open source structurée et partageable rapidement."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24 bg-card">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Comment ça marche</h2>
          </div>

          <div className="mx-auto max-w-4xl grid gap-6 grid-cols-1 sm:grid-cols-3">
            <StepCard
              number="01"
              title="Décrivez"
              desc="Entrez votre besoin en langage naturel, sans écrire de requête GitHub complexe."
            />
            <StepCard
              number="02"
              title="Vaultify analyse"
              desc="L'IA reformule, interroge GitHub en parallèle et calcule un score de pertinence."
            />
            <StepCard
              number="03"
              title="Décidez"
              desc="Comparez les repos, sauvegardez les meilleurs et capitalisez en collections."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Fonctionnalités</h2>
          </div>

          <div className="mx-auto max-w-5xl grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Recherche augmentée"
              desc="Reformulation IA + recherche parallèle pour des résultats plus riches."
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Scoring intelligent"
              desc="Notation de pertinence et résumé décisionnel pour chaque repository."
            />
            <FeatureCard
              icon={<BookmarkIcon className="h-5 w-5" />}
              title="Collections locales"
              desc="Sauvegarde, tags, notes, export JSON/Markdown et partage de sélection."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Talents béninois"
              desc="Module dédié pour explorer et analyser les profils devs du Bénin."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24 bg-card/50">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Questions fréquentes</h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {FAQS.map((item) => (
              <article key={item.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-center gap-2 font-label text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item.q}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground font-body">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-24 bg-card">
        <div className="container px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">Prêt à accélérer votre veille GitHub ?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground font-body">
            Lancez Vaultify, décrivez votre besoin et transformez votre recherche open source en décisions concrètes.
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

      <footer className="py-6">
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

const KpiCard = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-xl border border-border bg-card p-4 text-center card-hover">
    <p className="font-display text-2xl text-foreground">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground font-body">{label}</p>
  </div>
);

const ReasonCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <article className="rounded-xl border border-border bg-card p-5 card-hover">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
      {icon}
    </div>
    <h3 className="font-label text-sm text-foreground">{title}</h3>
    <p className="mt-1 text-xs text-muted-foreground font-body">{desc}</p>
  </article>
);

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
