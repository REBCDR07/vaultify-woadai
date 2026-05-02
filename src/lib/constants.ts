// AI models served through the proxy layer.

export const AI_MODELS = [
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    speed: "Très rapide",
    badge: "Recherche",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    speed: "Équilibré",
    badge: "Recommandé",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    speed: "Créatif",
    badge: "Illustration",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
] as const;

export const DEFAULT_MODEL = "gpt-5.4-mini";
export const REPO_ANALYSIS_MODEL = "gpt-5.5";
export const IMAGE_PROMPT_MODEL = "gpt-5.4";
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
