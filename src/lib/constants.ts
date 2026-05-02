// AI models exposed in the settings and used by the search pipeline.

export const AI_MODELS = [
  {
    id: "gpt-5.4-pro",
    name: "GPT-5.4 Pro",
    speed: "Le plus puissant",
    badge: "Analyse",
    description: "Modèle thinking principal avec vision pour l'analyse de repositories et de profils.",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    speed: "Équilibré",
    badge: "Recherche",
    description: "Modèle plus rapide pour reformulation, scoring et suggestions.",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
  {
    id: "gpt-5.3-codex",
    name: "GPT-5.3 Codex",
    speed: "Code",
    badge: "Vision",
    description: "Modèle spécialisé code avec vision pour les cas techniques lourds.",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
] as const;

export const DEFAULT_MODEL = "gpt-5.4-pro";
export const REPO_ANALYSIS_MODEL = "gpt-5.4-pro";
export const IMAGE_PROMPT_MODEL = "gpt-5.4-mini";
export const IMAGE_MODEL = "gpt-image-2";

export const CATEGORIES = [
  { label: "UI Components", query: "UI component library" },
  { label: "Icon Libraries", query: "icon library svg" },
  { label: "CSS Frameworks", query: "CSS framework utility" },
  { label: "CLI Tools", query: "CLI tool developer" },
  { label: "Design Systems", query: "design system tokens" },
  { label: "Fonts", query: "open source font collection" },
  { label: "Boilerplates", query: "boilerplate starter template" },
  { label: "Animation Libs", query: "animation library javascript" },
  { label: "State Management", query: "state management library" },
  { label: "Testing Tools", query: "testing framework tool" },
  { label: "DevOps", query: "devops automation tool" },
  { label: "API Tools", query: "API tool REST GraphQL" },
] as const;
