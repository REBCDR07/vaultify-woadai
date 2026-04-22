/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_API_KEY?: string;
  readonly VITE_AI_API_KEY_2?: string;
  readonly VITE_AI_API_KEY_3?: string;
  readonly VITE_AI_BASE_URL?: string;
  readonly VITE_AFRICHAT_SITE_KEY?: string;
  readonly VITE_AFRICHAT_CHAT_ENDPOINT?: string;
  readonly VITE_AFRICHAT_TTS_ENDPOINT?: string;
  readonly VITE_AFRICHAT_REALTIME_TOKEN_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
