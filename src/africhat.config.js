const parseEnvBoolean = (value, fallback = true) => {
  if (typeof value !== "string") return fallback;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;

  return !["0", "false", "no", "off"].includes(normalized);
};

const creatorProfile = {
  name: "Elton Ronald Bill Hounnou",
  role: "Developpeur Frontend",
  product: "Vaultify",
  mission:
    "Rendre la recherche de projets open source plus rapide, plus lisible et plus actionnable pour les developpeurs et equipes produit.",
};

const featureHighlights = [
  "Recherche GitHub augmentee par IA (reformulation + tri par pertinence)",
  "Scoring intelligent des repositories avec resume, cas d'usage et points forts",
  "Analyse detaillee de repository (description, stack compatible, suggestions)",
  "Suggestions de recherches connexes",
  "Analyse de profils developpeurs GitHub",
  "Exploration specialisee des developpeurs beninois",
  "Favoris, tags, notes, collections et exports JSON/Markdown",
  "Assistant conversationnel My AfriChat avec audio TTS",
];

const aiIntegration = {
  provider: "build.lewisnote.com/v1",
  endpoint: "POST /chat/completions",
  models: ["gpt-5.4-nano", "gpt-5.4-mini", "gpt-5.4", "gpt-5.3-codex"],
  enabledParameters: ["reasoning_effort", "web_search", "stream=false"],
  layers: [
    "Reformulation de requete utilisateur en plusieurs requetes GitHub complementaires",
    "Scoring de pertinence (0-100) et synthese de chaque repository",
    "Generation de suggestions de recherches",
    "Analyse detaillee des repositories",
    "Analyse de profils developpeurs",
  ],
};

const workflow = [
  {
    step: "01",
    title: "Saisie du besoin",
    detail:
      "L'utilisateur decrit son besoin en langage naturel (stack, cas d'usage, contraintes techniques).",
  },
  {
    step: "02",
    title: "Reformulation IA",
    detail: "L'IA produit plusieurs requetes GitHub pour couvrir differents angles de recherche.",
  },
  {
    step: "03",
    title: "Collecte parallele",
    detail: "Vaultify interroge l'API GitHub en parallele sur les requetes generees.",
  },
  {
    step: "04",
    title: "Fusion et deduplication",
    detail: "Les resultats sont fusionnes et dedupliques pour eviter les doublons.",
  },
  {
    step: "05",
    title: "Scoring et synthese",
    detail: "L'IA calcule un score de pertinence et produit une synthese exploitable.",
  },
  {
    step: "06",
    title: "Decision et capitalisation",
    detail:
      "L'utilisateur compare, sauvegarde en favoris, ajoute tags/notes, cree des collections et exporte.",
  },
];

const trustAndLimits = [
  "Favoris, historique et collections sont stockes localement dans le navigateur.",
  "Le token GitHub est optionnel: sans token l'app fonctionne, avec token les quotas API augmentent.",
  "Les recommandations IA sont une aide a la decision et non une garantie absolue.",
  "Toujours verifier README, licence, activite recente et qualite du projet avant adoption.",
  "Les variables VITE_* sont cote frontend et ne conviennent pas aux secrets stricts.",
];

const visitorFaq = [
  {
    question: "Vaultify est-il gratuit ?",
    answer: "Oui, l'application est gratuite et utilisable sans inscription.",
  },
  {
    question: "Faut-il une cle API pour utiliser Vaultify ?",
    answer:
      "Non. Les fonctionnalites IA sont preconfigurees. Seul un token GitHub est optionnel pour augmenter les quotas API.",
  },
  {
    question: "Quels modeles IA sont disponibles ?",
    answer: "GPT-5.4 Nano, GPT-5.4 Mini, GPT-5.4 et GPT-5.3 Codex.",
  },
  {
    question: "Comment Vaultify classe les repositories ?",
    answer:
      "L'IA reformule la demande, lance des recherches GitHub paralleles, fusionne les resultats puis attribue un score de pertinence.",
  },
  {
    question: "Qui est le createur ?",
    answer: "Elton Ronald Bill Hounnou, developpeur frontend.",
  },
];

const afriChatConfig = {
  site: {
    name: "Vaultify",
    description:
      "Moteur IA de decouverte de repositories GitHub avec scoring, synthese, analyse de profils developpeurs et accompagnement conversationnel.",
    defaultLanguage: "fr",
    supportedLanguages: ["fr", "en"],
  },
  version: 1,
  branding: {
    name: "Assistant Vaultify",
    accentColor: "#0a0a0a",
    launcherLabel: "Discuter",
    iconPreset: "afri-bronze",
    iconSize: "medium",
    welcomeMessage:
      "Bonjour, je suis l'assistant Vaultify. Je peux expliquer les fonctionnalites, les IA integrees, le fonctionnement de la plateforme et presenter son createur.",
  },
  assistant: {
    tone: "friendly",
    voice: "alloy",
    persona:
      "Conseiller produit Vaultify. Reponses claires, factuelles, actionnables, centrees sur les fonctionnalites reelles de la plateforme.",
    audioEnabled: parseEnvBoolean(import.meta.env.VITE_AFRICHAT_AUDIO_ENABLED, true),
    multilingual: true,
  },
  integration: {
    mode: "fullscreen",
    zIndex: 999999,
    position: "bottom-right",
  },
  knowledgeBase: {
    pages: [
      {
        path: "/",
        title: "Landing",
        summary:
          "Presentation complete de Vaultify: valeur produit, fonctionnalites, IA integrees, fonctionnement detaille, transparence et createur.",
      },
      {
        path: "/home",
        title: "Recherche",
        summary:
          "Point d'entree de recherche en langage naturel. L'IA analyse, reformule et prepare la recherche GitHub augmentee.",
      },
      {
        path: "/results",
        title: "Resultats",
        summary:
          "Affiche les repositories classes par pertinence avec score IA, resume decisionnel, cas d'usage et points forts.",
      },
      {
        path: "/repo/:owner/:repo",
        title: "Detail Repository",
        summary:
          "Analyse approfondie d'un repository: description technique, stack compatible, forces et recommandations associees.",
      },
      {
        path: "/favorites",
        title: "Favoris",
        summary:
          "Gestion locale des favoris, tags, notes, collections et exports en JSON/Markdown.",
      },
      {
        path: "/devs-benin",
        title: "Devs Beninois",
        summary:
          "Exploration ciblee des developpeurs du Benin avec aggregation de profils et analyse IA.",
      },
      {
        path: "/dev/:username",
        title: "Profil Developpeur",
        summary:
          "Lecture detaillee d'un profil GitHub: resume, expertise, fit collaboration et suggestions de projets.",
      },
      {
        path: "/settings",
        title: "Parametres",
        summary:
          "Choix du modele IA, suivi de tokens et configuration optionnelle du token GitHub.",
      },
    ],
    homeSummary:
      "Vaultify aide a passer d'une intention a une decision: reformulation IA, recherche GitHub parallele, scoring, synthese et capitalisation en favoris/collections.",
    businessRules: [
      "Repondre en francais par defaut et en anglais si l'utilisateur ecrit en anglais.",
      "Rester strictement centre sur les fonctionnalites reelles de Vaultify.",
      "Ne pas inventer de fonctionnalites ou de integrations absentes.",
      "Toujours donner des actions concretes (rechercher, comparer, filtrer, sauvegarder, exporter).",
      "Si l'utilisateur demande les modeles IA, citer: gpt-5.4-nano, gpt-5.4-mini, gpt-5.4, gpt-5.3-codex.",
      "Si l'utilisateur demande qui a cree Vaultify, repondre: Elton Ronald Bill Hounnou, developpeur frontend.",
      "Preciser que les favoris et collections sont stockes localement dans le navigateur.",
      "Preciser que le token GitHub est optionnel mais utile pour augmenter les quotas API.",
      "Rappeler que les reponses IA sont une aide a la decision et doivent etre validees.",
      "En cas de question produit, expliquer le pipeline: reformulation, collecte GitHub, scoring IA, decision utilisateur.",
    ],
    creatorProfile,
    featureHighlights,
    aiIntegration,
    workflow,
    trustAndLimits,
    visitorFaq,
  },
  api: {
    chatEndpoint:
      import.meta.env.VITE_AFRICHAT_CHAT_ENDPOINT ||
      "https://ptvvdtwdxophgwrascpf.supabase.co/functions/v1/widget-chat",
    ttsEndpoint:
      import.meta.env.VITE_AFRICHAT_TTS_ENDPOINT ||
      "https://ptvvdtwdxophgwrascpf.supabase.co/functions/v1/widget-tts",
    realtimeTokenEndpoint:
      import.meta.env.VITE_AFRICHAT_REALTIME_TOKEN_ENDPOINT ||
      "https://ptvvdtwdxophgwrascpf.supabase.co/functions/v1/widget-realtime-token",
    siteKey:
      import.meta.env.VITE_AFRICHAT_SITE_KEY ||
      "afc_live_xxxxxxxxxxxx.yyyyyyyyyyyyyyyy",
  },
};

export default afriChatConfig;
