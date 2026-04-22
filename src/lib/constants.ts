export const AI_MODELS = [
  { id: "gpt-5.4-nano", name: "GPT-5.4 Nano", speed: "Ultra rapide", badge: "Economique" },
  { id: "gpt-5.4-mini", name: "GPT-5.4 Mini", speed: "Equilibre", badge: "Recommande" },
  { id: "gpt-5.4", name: "GPT-5.4", speed: "Approfondi", badge: "Expert" },
  { id: "gpt-5.3-codex", name: "GPT-5.3 Codex", speed: "Code", badge: "Technique" },
] as const;

export const DEFAULT_MODEL = "gpt-5.4-mini";
export const REPO_ANALYSIS_MODEL = "gpt-5.3-codex";

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
