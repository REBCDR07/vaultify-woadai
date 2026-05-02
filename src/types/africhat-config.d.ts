import type { MyAfriChatConfig } from "my-africhat";

declare module "*.config.js" {
  type VaultifyAfriChatConfig = MyAfriChatConfig & {
    site?: MyAfriChatConfig["site"] & { description?: string };
    assistant?: NonNullable<MyAfriChatConfig["assistant"]> & {
      tone?: string;
      persona?: string;
      model?: string;
      web_search?: boolean;
      multilingual?: boolean;
    };
    knowledgeBase?: Record<string, unknown>;
    [key: string]: unknown;
  };

  const config: VaultifyAfriChatConfig;
  export default config;
}
