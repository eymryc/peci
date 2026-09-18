# PECI — Promouvoir l'Éducation en Côte d'Ivoire

Plateforme numérique officielle de PECI : site institutionnel public,
adhésion en ligne, espace membre (carte numérique avec vérification par QR
code, droit d'adhésion et cotisations mensuelles), et administration.

## Architecture

```
peci/
├── backend/     API REST Laravel + MySQL (voir backend/README.md)
└── frontend/    Application Next.js (App Router, TypeScript, Tailwind)
```

Le frontend Next.js ne communique **jamais** directement avec MySQL : toutes
les données transitent par l'API REST Laravel (`backend/`).

## Démarrage rapide

```bash
# 1. Backend (API)
cd backend
composer install
cp .env.example .env
php artisan key:generate
# configurer DB_* dans .env (voir backend/README.md), puis :
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8091

# 2. Frontend
cd ../frontend
npm install
npm run dev
```

Frontend : http://localhost:3000 — API : http://localhost:8091
(le port 8091 évite les conflits avec d'autres projets Laravel tournant en
local sur le port 8000 par défaut ; ajustez `APP_URL` / `NEXT_PUBLIC_API_URL`
si vous préférez un autre port. En développement sur cette machine, le
frontend a aussi été testé sur le port 3050 pour éviter des conflits locaux
similaires — `npm run dev -- -p 3050` si besoin.)

## État du projet

**Backend (Laravel + MySQL) :** architecture complète, migrations pour
toutes les entités (membres, cartes, cotisations, projets, actualités,
ressources, bénévoles, dons, partenaires, paramètres, journal d'activité),
authentification Sanctum par token, `MemberCardService` (numéro unique, QR
code, image et PDF de carte générés automatiquement à l'approbation), API
REST complète (public, membre, admin) avec réponses au format uniforme.

**Frontend (Next.js + TypeScript + Tailwind) :** identité visuelle PECI
(dégradé turquoise/vert plus affirmé, menu plein écran animé façon
"papier découpé", typographie généreuse), page d'accueil complète (hero
avec support vidéo + repli image, mission, chiffres clés, actions, projets,
carte des régions interactive, impact animé, actualités, galerie, CTA
adhésion/don, partenaires), pages institutionnelles (qui sommes-nous, nos
actions, nos projets + détail, actualités + détail, ressources, galerie,
bénévolat, don, partenaires, transparence), page publique de vérification
de carte par QR (`/verifier/[numéro]`), un espace membre protégé, et une
administration complète : tableau de bord avec graphiques (Recharts),
gestion des demandes d'adhésion (approbation/refus), liste des membres,
confirmation des paiements, **CRUD complet pour le contenu** (projets avec
galerie et timeline, actualités avec catégories, ressources avec
catégories, partenaires, actions), et page de paramètres pour ajuster les
montants des cotisations et les textes/chiffres de la page d'accueil sans
toucher à la base de données.

**Adhésion et espace membre :** membre actif, bienfaiteur (donateur) ou
honoraire remplissent le formulaire d'adhésion (`/devenir-membre`) avec un
mot de passe. Une fois la demande validée par un admin, ils se connectent à
leur espace membre (`/espace-membre`) pour télécharger leur carte (PDF +
image), gérer leur profil, et surtout **régler leur droit d'adhésion et
leurs cotisations mensuelles** — déclaration de paiement (Orange Money, MTN
Money, Moov Money, Wave, carte) confirmée ensuite par l'équipe PECI depuis
`/admin/paiements` (aucun paiement réel n'est simulé).

**Vérifié de bout en bout :** inscription → approbation admin → génération
automatique de la carte → connexion membre → déclaration puis confirmation
admin d'un paiement → vérification publique QR, ainsi que la création de
projets/actualités/partenaires/actions depuis l'admin et leur apparition
immédiate sur le site public — testé dans un vrai navigateur avec du texte
accentué français. `npm run build`, `tsc --noEmit`, `eslint` et
`php artisan test` (21 tests / 68 assertions) passent tous sans erreur.

**Reste à construire :** intégrations de paiement réelles (préparées
uniquement, jamais simulées — conforme au cahier des charges), notifications
SMS/WhatsApp (nécessitent un fournisseur tiers), et un tracé SVG précis des
régions de Côte d'Ivoire pour la carte interactive (grille stylisée pour
l'instant, faute de fichier géographique officiel disponible).

## Identité visuelle

Logo officiel : `logo.jpg` (racine du projet, ne pas modifier). Couleurs :
`#17A79D` (vert turquoise) et `#8EC44C` (vert clair).
