# PECI — Backend (API Laravel)

API REST du site institutionnel et de la plateforme membre de PECI
(*Promouvoir l'Éducation en Côte d'Ivoire*). Next.js (dossier `../frontend`)
consomme cette API — il ne se connecte jamais directement à MySQL.

## Stack

- Laravel 13 / PHP 8.3
- MySQL
- Laravel Sanctum (authentification par token)
- `endroid/qr-code`, `intervention/image`, `barryvdh/laravel-dompdf`
  (génération de la carte de membre : QR, image, PDF)

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configurer `.env` (MySQL local, ex. Laragon — root sans mot de passe) :

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peci
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

Créer la base puis migrer + peupler :

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS peci CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8091
```

## Comptes de démonstration (seeders)

Toutes les données créées par les seeders sont préfixées `[DEMO]` — à
remplacer par les vraies informations de PECI depuis l'administration.

| Rôle   | Email               | Mot de passe |
|--------|---------------------|--------------|
| Admin  | admin@peci.demo     | password     |
| Staff  | staff@peci.demo     | password     |
| Membre | membre@peci.demo    | password     |

Le membre de démo (`PECI-2026-000001`) a déjà une carte générée (QR + image
+ PDF) et un historique de cotisations (droit d'adhésion payé, une
cotisation mensuelle payée, une en attente) consultables dans son espace
membre après connexion.

## Format des réponses API

```json
// Succès
{ "success": true, "message": "...", "data": {} }

// Erreur
{ "success": false, "message": "...", "errors": {} }
```

## Principaux endpoints (itération 1)

**Public**
- `POST /api/auth/login`, `POST /api/auth/register` (= devenir membre — actif,
  bienfaiteur/donateur ou honoraire selon `membership_type_id` — avec mot de passe)
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- `GET /api/public/members/{memberNumber}/verify` — vérification publique de carte
- `GET /api/public/settings`, `GET /api/public/regions`, `GET /api/public/membership-types`
- `GET /api/projects`, `GET /api/projects/{slug}`
- `GET /api/news`, `GET /api/news/{slug}`
- `GET /api/resources`, `POST /api/resources/{id}/download`
- `GET /api/actions`, `GET /api/partners`, `POST /api/partners/contact`
- `POST /api/volunteers`, `POST /api/donations`

**Membre connecté** (`Authorization: Bearer {token}`)
- `GET/PUT /api/member/profile`
- `GET /api/member/card`, `GET /api/member/card/pdf`, `GET /api/member/card/image`
- `GET /api/member/payments` — historique + montants du droit d'adhésion et
  de la cotisation mensuelle en cours (`fees`), statut `adhesion_paid`
- `POST /api/member/payments` — déclare un paiement (`type: adhesion|cotisation`,
  `period` au format `YYYY-MM` pour une cotisation, `method`) en statut
  `pending` ; aucun paiement réel n'est simulé, une confirmation manuelle
  par l'équipe suit (voir admin ci-dessous)
- `GET /api/member/notifications`

**Admin / Staff** (rôle `admin` ou `staff`)
- `GET /api/admin/members`, `GET /api/admin/members/{id}`
- `GET /api/admin/memberships/pending`
- `POST /api/admin/memberships/{id}/approve` — génère automatiquement le
  numéro de membre, la carte (QR + image + PDF) et notifie le membre
- `POST /api/admin/memberships/{id}/reject`
- `GET /api/admin/payments` — tous les paiements déclarés, filtrables par statut
- `POST /api/admin/payments/{id}/mark-paid` — confirme un paiement reçu

**Admin / Staff — gestion de contenu** (rôle `admin` ou `staff`)
- `GET /api/admin/dashboard` — statistiques + séries pour les graphiques
  (membres, cotisations, projets par statut, membres par type d'adhésion)
- CRUD complet (`GET/POST/PUT/DELETE`) : `/admin/projects` (+ sous-routes
  `/images` et `/updates` pour la galerie et la timeline d'un projet),
  `/admin/news` (+ `/admin/news-categories`), `/admin/resources`
  (+ `/admin/resource-categories`), `/admin/partners`, `/admin/actions`

**Admin uniquement** (rôle `admin`)
- `GET /api/admin/settings` — liste tous les paramètres (montants des
  cotisations, chiffres clés et textes du hero de la page d'accueil)
- `PUT /api/admin/settings` — met à jour un ou plusieurs paramètres
  (`{"settings":[{"key":"public_fee_cotisation","value":"2000"}]}`)

## Carte de membre (`MemberCardService`)

`app/Services/MemberCardService.php` centralise toute la logique métier :
génération du numéro (`PECI-{année}-{6 chiffres}`, unique), du QR code
(pointant vers `{FRONTEND_URL}/verifier/{numéro}`), de l'image recto
(format CR80, 1013×638px/300 DPI) et du PDF recto/verso. Les fichiers sont
stockés sur le disque `local` (privé) sous
`storage/app/private/member-cards/{numéro}/` et ne sont jamais exposés
publiquement — ils sont servis via les routes authentifiées
`/api/member/card/pdf` et `/api/member/card/image`.

## Cotisations (`MembershipPayment`)

Deux types de paiement, table `membership_payments` :
- `adhesion` — droit d'adhésion, réglé une seule fois (`period` = `null`) ;
- `cotisation` — mensuelle, une ligne par mois (`period` au format `YYYY-MM`).

Les montants sont configurables via `Setting` (`public_fee_adhesion`,
`public_fee_cotisation`, exposés par `/api/public/settings`). Un membre
déclare un paiement (`POST /api/member/payments`) avec un statut `pending`
et une référence générée — **aucune intégration de paiement réelle** n'est
branchée (conforme au cahier des charges) ; un admin confirme la réception
via `POST /api/admin/payments/{id}/mark-paid`.

## Stockage des fichiers

- Disque `public` (`storage/app/public`, lié via `storage:link`) : images
  de projets/actualités, logos partenaires, ressources téléchargeables —
  contenu public par nature.
- Disque `local` (`storage/app/private`) : photos de membres, documents
  d'adhésion, cartes de membre — jamais exposés directement, toujours
  servis via un contrôleur authentifié.

## Tests automatisés

```bash
php artisan test
```

21 tests / 68 assertions (PHPUnit, SQLite en mémoire — voir `tests/Feature`) :
authentification, workflow d'adhésion complet (approbation → génération de
carte → vérification publique), cotisations (déclaration, doublons,
confirmation admin), CRUD de contenu et permissions par rôle.

## Prochaines itérations

Le frontend Next.js (`../frontend`) consomme déjà cette API : site public,
adhésion, espace membre (carte, cotisations, profil, notifications) et une
administration complète (CRUD contenu, tableau de bord avec graphiques,
paramètres) sont fonctionnels (voir le [README racine](../README.md)).
Restent : intégrations de paiement réelles (Mobile Money, carte bancaire —
volontairement non simulées), notifications SMS/WhatsApp (nécessitent des
identifiants d'un fournisseur tiers), et un tracé SVG géographique précis
des régions de Côte d'Ivoire pour la carte interactive.
