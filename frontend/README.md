# PECI — Frontend (Next.js)

Site public et administration de PECI. Consomme l'API Laravel
(`../backend`) — ne communique jamais directement avec MySQL.

## Stack

- Next.js 16 (App Router, Turbopack) / React 19 / TypeScript
- Tailwind CSS v4 (thème PECI défini dans `app/globals.css`)
- Framer Motion (animations), Lucide React (icônes)
- react-hook-form + zod (formulaires), fetch natif (`lib/api.ts`)

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` doit pointer vers l'API Laravel :

```
NEXT_PUBLIC_API_URL=http://localhost:8091/api
NEXT_PUBLIC_ASSET_URL=http://localhost:8091
```

## Structure

```
app/                 Pages (App Router)
  devenir-membre/      Formulaire d'adhésion (avec mot de passe)
  espace-membre/       Zone membre protégée (layout avec garde d'auth)
  admin/               Administration protégée (rôle admin/staff)
  verifier/[memberNumber]/   Page publique de vérification de carte
components/
  ui/                  Composants réutilisables (Button, Field, Badge…)
  layout/              Header, MenuOverlay, Footer, SiteChrome
  home/                Sections de la page d'accueil
  forms/               Formulaires (adhésion, bénévolat, don, partenaire)
  admin/               Formulaires CRUD (projets, actualités, ressources,
                       partenaires, actions) + sélecteur de catégorie
                       avec création à la volée
lib/
  api.ts               Client HTTP vers l'API Laravel
  auth-context.tsx      Contexte d'authentification (token Bearer)
  use-member.ts          Hook de récupération du profil membre
types/                Types TypeScript partagés avec l'API
```

## Adhésion, espace membre et cotisations

Les membres (actif, bienfaiteur/donateur, honoraire) créent un compte dès
l'inscription (`/devenir-membre`, mot de passe requis). Une fois leur
demande validée par un admin, ils se connectent (`/connexion` →
`/espace-membre`) pour :

- télécharger leur carte (PDF/image) — `espace-membre/carte`
- gérer leur profil — `espace-membre/profil`
- **régler leur droit d'adhésion et leurs cotisations mensuelles** —
  `espace-membre/cotisations`, via `MembershipPayment` (déclaration d'un
  paiement avec méthode, confirmé ensuite par un admin depuis
  `/admin/paiements` — aucun paiement en ligne réel n'est simulé)
- consulter leurs notifications — `espace-membre/notifications`

Admin et staff se connectent au même endroit (`/connexion`) pour accéder à
`/admin` : tableau de bord avec graphiques (Recharts — membres, cotisations,
projets par statut), demandes d'adhésion, membres, paiements, et le CRUD
complet du contenu (`/admin/projets`, `/admin/actualites`,
`/admin/ressources`, `/admin/partenaires`, `/admin/actions`). Les montants
des cotisations et les textes/chiffres de la page d'accueil se modifient
sur `/admin/parametres` (réservé au rôle `admin`).

## Points d'attention

- La section "carte interactive de Côte d'Ivoire" (page d'accueil) utilise
  une grille stylisée par région (`components/home/RegionsMap.tsx`), faute
  de tracé SVG géographique officiel disponible dans ce projet — le
  composant consomme les mêmes données (`/api/public/regions`) et peut être
  remplacé par un vrai contour SVG sans changer l'API.
- Le hero (`components/home/Hero.tsx`) accepte une vidéo d'arrière-plan
  optionnelle : déposer `hero.mp4` / `hero.webm` dans `public/videos/` pour
  l'activer ; sans fichier, repli automatique sur l'image avec effet Ken
  Burns (aucune erreur, juste un 404 silencieux géré par `onError`).
- `next.config.ts` active `images.dangerouslyAllowLocalIP` car le backend
  tourne en local en développement ; en production, `NEXT_PUBLIC_API_URL`
  pointera vers un domaine public réel.

## Vérification

```bash
npx tsc --noEmit
npx eslint .
npm run build
```
