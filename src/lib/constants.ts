// LewisNote models — served via the ai-proxy edge function.
// User-provided keys are optional; server keys provide automatic fallback.

export const AI_MODELS = [
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    speed: "Très rapide",
    badge: "Recommandé",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4 Thinking",
    speed: "Reasoning profond",
    badge: "Reasoning",
    supportsWebSearch: true,
    supportsReasoning: true,
  },
] as const;

// Backward compat (some files still import GROQ_MODELS / DEFAULT_MODEL)
export const GROQ_MODELS = AI_MODELS;
export const DEFAULT_MODEL = "gpt-5.5";

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
