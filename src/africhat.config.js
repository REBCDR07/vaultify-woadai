const afriChatConfig = {
  site: {
    name: "Vaultify",
    description:
      "Moteur IA de découverte de repositories GitHub avec scoring, synthèse et analyse de profils développeurs.",
    defaultLanguage: "fr",
    supportedLanguages: ["fr", "en"],
  },
  version: 1,
  branding: {
    name: "Assistant Vaultify",
    accentColor: "#0f766e",
    launcherLabel: "Discuter",
    welcomeMessage:
      "Bonjour, je suis l'assistant Vaultify. Je peux vous guider pour la recherche de repositories et l'utilisation de la plateforme.",
  },
  assistant: {
    tone: "friendly",
    voice: "alloy",
    persona: "Conseiller client Vaultify",
    audioEnabled: false,
    multilingual: true,
  },
  integration: {
    zIndex: 999999,
    position: "bottom-right",
  },
  knowledgeBase: {
    pages: [
      {
        path: "/",
        title: "Landing",
        summary: "Présentation de Vaultify et de ses fonctionnalités principales.",
      },
      {
        path: "/home",
        title: "Recherche",
        summary: "Recherche de repositories GitHub avec enrichissement IA.",
      },
      {
        path: "/favorites",
        title: "Favoris",
        summary: "Gestion locale des favoris, tags, notes et exports.",
      },
      {
        path: "/devs-benin",
        title: "Devs Béninois",
        summary: "Exploration et analyse des profils développeurs du Bénin.",
      },
      {
        path: "/settings",
        title: "Paramètres",
        summary: "Choix du modèle IA et configuration optionnelle du token GitHub.",
      },
    ],
    homeSummary:
      "Vaultify aide à trouver rapidement les bons projets open source sur GitHub, avec reformulation de requête, scoring IA et résumés actionnables.",
    businessRules: [
      "Répondre en français par défaut et en anglais si l'utilisateur écrit en anglais.",
      "Rester centré sur les fonctionnalités de Vaultify et ne pas inventer des options inexistantes.",
      "Proposer des actions concrètes pour rechercher, comparer et sauvegarder des repositories.",
    ],
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

