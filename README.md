# Vaultify

Vaultify est une application web de découverte GitHub assistée par IA. Elle transforme une recherche naturelle en sélection priorisée de repositories avec scoring, synthèse et recommandations.

## Valeur Produit

- Recherche GitHub augmentée par IA (reformulation + tri par pertinence).
- Analyse technique détaillée de repositories.
- Analyse de profils développeurs GitHub.
- Module spécialisé pour explorer les développeurs béninois.
- Gestion locale des favoris, collections et historique.

## Fonctionnalités

- Recherche parallèle multi-requêtes sur l'API GitHub.
- Scoring IA avec résumé, cas d'usage et points forts.
- Suggestions de recherches connexes.
- Vue détaillée d'un repository avec analyse IA.
- Export des favoris en `JSON` et `Markdown`.
- SEO renforcé: Open Graph, Twitter Cards, JSON-LD, sitemap, robots.

## Stack Technique

| Domaine | Outils |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, Lucide Icons |
| State | Zustand |
| Routing | React Router |
| Tests | Vitest |

## Intégration IA

- Base URL: `https://build.lewisnote.com/v1`
- Endpoint: `POST /chat/completions`
- Modèles disponibles:
  - `gpt-5.4-nano`
  - `gpt-5.4-mini`
  - `gpt-5.4`
  - `gpt-5.3-codex`

Paramètres activés côté client:

- `reasoning_effort`
- `web_search`
- `stream: false`

Le paramètre `temperature` n'est pas envoyé (incompatible avec ce provider).

## Configuration Environnement

Créer `.env` à la racine:

```env
VITE_AI_BASE_URL=https://build.lewisnote.com/v1
VITE_AI_API_KEY=sk-afri-xxxxxxxxxxxxxxxx
VITE_AI_API_KEY_2=sk-afri-xxxxxxxxxxxxxxxx
VITE_AI_API_KEY_3=sk-afri-xxxxxxxxxxxxxxxx

VITE_AFRICHAT_SITE_KEY=afc_live_xxxxxxxxxxxx.yyyyyyyyyyyyyyyy
VITE_AFRICHAT_CHAT_ENDPOINT=https://ptvvdtwdxophgwrascpf.supabase.co/functions/v1/widget-chat
VITE_AFRICHAT_TTS_ENDPOINT=https://ptvvdtwdxophgwrascpf.supabase.co/functions/v1/widget-tts
VITE_AFRICHAT_REALTIME_TOKEN_ENDPOINT=https://ptvvdtwdxophgwrascpf.supabase.co/functions/v1/widget-realtime-token
VITE_AFRICHAT_AUDIO_ENABLED=true
```

Règles d'usage:

- Les utilisateurs ne saisissent plus de clé IA dans l'interface.
- Seul le token GitHub est optionnel en configuration utilisateur.
- Fallback automatique entre `VITE_AI_API_KEY`, `VITE_AI_API_KEY_2`, `VITE_AI_API_KEY_3` en cas de `401/403/429/5xx`.

### Widget Conversationnel (My AfriChat)

- Package: `my-africhat`
- Montage automatique dans `src/main.tsx`
- Configuration centralisée: `src/africhat.config.js`
- Le widget ne se monte pas tant que `VITE_AFRICHAT_SITE_KEY` est laissé au placeholder.
- L'audio du widget est actif par défaut; définir `VITE_AFRICHAT_AUDIO_ENABLED=false` pour le désactiver.

## Démarrage

```bash
npm install
npm run dev
```

## Scripts Disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

## Architecture (fichiers clés)

- `src/pages/Landing.tsx` : landing page et contenu SEO.
- `src/pages/Results.tsx` : moteur de recherche enrichi IA.
- `src/pages/RepoDetail.tsx` : analyse détaillée d'un repository.
- `src/pages/DevProfile.tsx` : analyse de profil développeur.
- `src/pages/BeninDevs.tsx` : exploration des développeurs béninois.
- `src/lib/ai.ts` : client IA + fallback multi-clés.
- `src/lib/github.ts` : couche API GitHub.

## Assets SEO & Social

- `public/favicon.svg`
- `public/favicon.ico`
- `public/og-image.jpg` (`1200x630`)
- `public/og-image-square.jpg` (`1200x1200`)
- `public/sitemap.xml`
- `public/robots.txt`

## Sécurité

Les variables `VITE_*` sont injectées dans le bundle frontend. Ce choix est intentionnel pour ce projet, mais inadapté à un contexte nécessitant la confidentialité stricte des clés API.
