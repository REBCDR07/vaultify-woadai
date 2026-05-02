# Vaultify

Vaultify est une application web de decouverte GitHub assistee par IA. Elle transforme une recherche naturelle en selection priorisee de repositories avec scoring, synthese, recommandations et illustrations.

## Valeur produit

- Recherche GitHub augmentee par IA (reformulation + tri par pertinence).
- Analyse technique detaillee de repositories.
- Analyse de profils developpeurs GitHub.
- Exploration specialisee des developpeurs beninois.
- Gestion locale des favoris, collections et historique.
- Carrousels d'illustration GPT Image 2 pour les repositories publics.

## Fonctionnalites

- Recherche parallele multi-requetes sur l'API GitHub.
- Scoring IA avec resume, cas d'usage et points forts.
- Suggestions de recherches connexes.
- Vue detaillee d'un repository avec analyse IA.
- Generation d'illustrations paysage, portrait ou carre via GPT Image 2.
- Telechargement image par image dans le carrousel.
- Export des favoris en `JSON` et `Markdown`.
- SEO renforce: Open Graph, Twitter Cards, JSON-LD, sitemap, robots.

## Stack technique

| Domaine | Outils |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, Lucide Icons |
| State | Zustand |
| Routing | React Router |
| Tests | Vitest |

## IA integrees

Modeles texte disponibles:

- `gpt-5.5`
- `gpt-5.4-mini`
- `gpt-5.4`

Modele image:

- `gpt-image-2`

Role des couches IA:

- Reformulation de requete: generation de 4 requetes GitHub complementaires.
- Scoring et synthese: score (0-100), resume, cas d'usage et points forts.
- Suggestions: propositions de recherches connexes.
- Analyse detaillee repo: synthese approfondie avec focus technique.
- Illustration repo: GPT-5.4 genere un plan de prompts, GPT Image 2 produit un carrousel paysage 8k ultra de 3 a 10 images.
- Assistant conversationnel: widget My AfriChat branche via proxy Supabase.

Les appels IA passent par des fonctions Supabase deployees. Aucun secret n'est demande aux utilisateurs.

## Flux produit

1. L'utilisateur decrit son besoin en langage naturel.
2. L'IA reformule la demande en plusieurs requetes GitHub.
3. Vaultify interroge GitHub en parallele.
4. Les resultats sont fusionnes et dedupliques.
5. L'IA score les repositories et produit une synthese exploitable.
6. L'interface propose comparaison, favoris, tags, notes et collections.
7. L'utilisateur peut exporter ses donnees en `JSON` ou `Markdown`.
8. Sur un repository public, Vaultify peut generer un carrousel d'illustrations via GPT Image 2.

## Widget conversationnel (My AfriChat)

- Package: `my-africhat`
- Montage automatique dans `src/main.tsx`
- Configuration centralisee: `src/africhat.config.js`
- Endpoints deployes: `widget-chat`, `widget-tts`, `widget-realtime-token`
- Audio desactive par defaut; activer `VITE_AFRICHAT_AUDIO_ENABLED=true` seulement si le flux TTS est configure.

## Demarrage

```bash
npm install
npm run dev
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

## Architecture (fichiers cles)

- `src/pages/Landing.tsx` : landing page et informations produit visiteurs.
- `src/pages/Results.tsx` : moteur de recherche enrichi IA.
- `src/pages/RepoDetail.tsx` : analyse detaillee d'un repository et illustrations IA.
- `src/pages/DevProfile.tsx` : analyse de profil developpeur.
- `src/pages/BeninDevs.tsx` : exploration des developpeurs beninois.
- `src/lib/ai.ts` : client IA via proxy Supabase + images GPT Image 2.
- `src/lib/github.ts` : couche API GitHub.
- `supabase/functions/ai-proxy/index.ts` : proxy chat texte.
- `supabase/functions/image-proxy/index.ts` : proxy generation d'images.
- `supabase/functions/widget-chat/index.ts` : proxy du widget AfriChat.
- `supabase/functions/widget-tts/index.ts` : proxy TTS si l'audio est active.
- `supabase/functions/widget-realtime-token/index.ts` : jeton realtime optionnel.

## Transparence et limites

- Les recommandations IA sont une aide a la decision, pas une garantie absolue.
- Verifier systematiquement la licence, l'activite et la qualite du README d'un repo.
- Sans token GitHub, les quotas d'API sont plus limites.
- Les variables `VITE_*` et les secrets serveur sont configures au deploiement.

## Assets SEO et social

- `public/favicon.svg`
- `public/favicon.ico`
- `public/og-image.jpg` (`1200x630`)
- `public/og-image-square.jpg` (`1200x1200`)
- `public/sitemap.xml`
- `public/robots.txt`

## Variables de deploiement

Cote frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_AFRICHAT_SITE_KEY`
- `VITE_AFRICHAT_CHAT_ENDPOINT` (optionnel)
- `VITE_AFRICHAT_TTS_ENDPOINT` (optionnel)
- `VITE_AFRICHAT_REALTIME_TOKEN_ENDPOINT` (optionnel)
- `VITE_AFRICHAT_AUDIO_ENABLED` (optionnel)

Cote Supabase / proxy:

- `AI_BASE_URL`
- `AI_API_KEY_1` a `AI_API_KEY_5`
- `AI_TTS_BASE_URL` (optionnel)
- `AI_TTS_API_KEY_1` a `AI_TTS_API_KEY_5` (optionnel)
- `AFRICHAT_SITE_KEY`
- `AFRICHAT_MODEL` (optionnel, defaut `gpt-5.4-mini`)
- `AFRICHAT_REASONING_EFFORT` (optionnel, defaut `medium`)
- `AFRICHAT_TTS_MODEL` (optionnel)
- `AFRICHAT_TTS_VOICE` (optionnel)
- `AFRICHAT_REALTIME_TOKEN` (optionnel)
