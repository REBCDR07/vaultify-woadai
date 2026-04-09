export const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", speed: "~280 t/s", badge: "Recommandé" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", speed: "~560 t/s", badge: "Stable" },
  { id: "llama3-70b-8192", name: "GPT OSS 120B", speed: "~500 t/s", badge: "Stable" },
  { id: "llama3-8b-8192", name: "GPT OSS 20B", speed: "~1000 t/s", badge: "Stable" },
  { id: "meta-llama/llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick 17B", speed: "—", badge: "Preview" },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B", speed: "—", badge: "Preview" },
  { id: "qwen-qwq-32b", name: "Qwen 3 32B", speed: "—", badge: "Preview" },
] as const;

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

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
