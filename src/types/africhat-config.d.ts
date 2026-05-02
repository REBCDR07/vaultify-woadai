import type { MyAfriChatConfig } from "my-africhat";

declare module "*.config.js" {
  type VaultifyAfriChatConfig = MyAfriChatConfig & {
    knowledgeBase?: Record<string, unknown>;
  };

  const config: VaultifyAfriChatConfig;
  export default config;
}
