# Clebo

Clebo est un SaaS de dressage canin vendu au grand public en France, sur
abonnement mensuel unique à **27,99€/mois**. Le site permet d'enregistrer
son ou ses chiens, de suivre des techniques de dressage adaptées à chaque
race (texte, image, vidéo), de calculer les besoins alimentaires
quotidiens, et de demander des exercices sur-mesure validés par une
équipe d'administration.

## Fonctionnalités

- **Comptes utilisateurs** : inscription/connexion par email + mot de
  passe, session httpOnly signée (30 jours).
- **Profils de chiens** : nom, race, taille, poids, âge, environnement de
  vie (campagne / ville / appartement / maison). La race est choisie via
  une barre de recherche (`components/BreedSearch.tsx`) ; si elle
  n'existe pas encore (race rare ou chien croisé), le client la crée
  directement et une IA (Claude) génère sa fiche complète et son guide de
  dressage (voir `lib/breedGeneration.ts`). Optionnel : sans
  `ANTHROPIC_API_KEY`, la création de race échoue proprement avec un
  message, le reste du site fonctionne normalement.
- **Races de chien** : 15 races courantes en France pré-chargées (voir
  `prisma/data/breeds.ts`), plus toute race créée par un client via la
  recherche ci-dessus, chacune avec sa propre illustration, sa
  description, son tempérament et son gabarit de poids adulte.
- **Bibliothèque d'exercices de dressage** : base de données d'exercices
  (propreté, rappel, laisse, obéissance de base, socialisation), chacun
  avec description détaillée, image, vidéo (URL), nombre de répétitions
  et fréquence recommandés. Exercices génériques ("toutes races") et
  exercices spécifiques à certaines races (table de jointure
  `ExerciseBreed`).
- **Demandes d'exercices sur-mesure** : un utilisateur abonné peut
  demander un exercice qui n'existe pas dans la bibliothèque de base ;
  une IA (Claude) génère aussitôt son déroulé complet, les erreurs à
  éviter et la durée d'acquisition estimée (voir
  `lib/customExerciseGeneration.ts`). Une vraie vidéo de démonstration est
  intégrée automatiquement via l'API YouTube Data v3 si `YOUTUBE_API_KEY`
  est configurée (voir `lib/youtubeSearch.ts`), sinon un simple lien de
  recherche s'affiche. Si l'IA (Claude) n'est pas configurée ou échoue, la
  demande reste "en attente" pour une validation manuelle classique via
  `/admin`.
- **Alimentation** : calculateur de quantité de croquettes, de repas et
  d'eau par jour à partir du poids/âge/environnement du chien
  (`lib/feeding.ts`), et marques de nourriture conseillées par race.
- **Abonnement unique Stripe** : 27,99€/mois, pas d'essai gratuit, statut
  vérifié en base (mis à jour par webhook Stripe, jamais fait confiance
  depuis le cookie client seul).
- **Contenu premium gardé côté serveur** : le détail complet d'un exercice
  (déroulé, vidéo) n'est rendu que si l'abonnement de l'utilisateur est
  actif en base — sinon un teaser avec appel à l'abonnement s'affiche.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript, Tailwind CSS v4
- Prisma + Postgres (dev et prod — nécessaire car le site est destiné à
  être déployé sur un hébergeur serverless, où un fichier SQLite ne
  persisterait pas entre deux déploiements)
- Stripe Checkout (mode abonnement) + webhook pour la synchronisation du
  statut d'abonnement
- `bcryptjs` pour le hash des mots de passe
- `proxy.ts` (remplace `middleware.ts` depuis Next 16) : garde de route
  serveur pour les pages qui nécessitent une connexion

## Mettre le site en ligne sans rien installer (recommandé)

Cette méthode se fait entièrement dans le navigateur, sans terminal ni
Node.js sur ton ordinateur — via [Vercel](https://vercel.com), qui héberge
gratuitement ce type de site.

1. **Créer un compte Vercel** sur [vercel.com](https://vercel.com) en
   cliquant sur "Continue with GitHub" — utilise le même compte GitHub que
   celui qui possède ce dépôt (`Loanyou85`).
2. Sur le tableau de bord Vercel, cliquer **Add New...** → **Project**,
   puis choisir d'importer le dépôt `Loanyou85/Clebo-`. Next.js est
   détecté automatiquement, aucune configuration à toucher ici.
3. **Avant de cliquer sur Deploy**, dérouler **Environment Variables** et
   ajouter au minimum :
   - `COOKIE_SIGNING_SECRET` → n'importe quelle longue suite de
     caractères aléatoires (ex : tape au hasard sur le clavier, 40
     caractères).
   - `NEXT_PUBLIC_SITE_URL` → laisse vide pour l'instant, tu la
     complèteras à l'étape 5 avec l'adresse donnée par Vercel.
   - Les 4 variables Stripe peuvent rester vides pour l'instant : le site
     fonctionnera entièrement sauf le bouton de paiement (à activer plus
     tard, voir "Configuration Stripe" ci-dessous).
4. **Créer la base de données** : dans le même écran (ou dans l'onglet
   **Storage** du projet une fois créé), cliquer **Create Database** →
   choisir **Postgres** (propulsé par Neon) → suivre les étapes puis
   **Connect** au projet. Vercel ajoute automatiquement la variable
   `DATABASE_URL` pour toi — rien à copier-coller.
5. Cliquer **Deploy**. Après quelques minutes, Vercel donne une adresse du
   type `https://clebo-xxxx.vercel.app` : c'est ton site, en ligne,
   accessible par n'importe qui. Retourne dans **Settings → Environment
   Variables**, mets à jour `NEXT_PUBLIC_SITE_URL` avec cette adresse, puis
   clique **Redeploy** (onglet **Deployments** → "..." sur le dernier
   déploiement → **Redeploy**).

À chaque déploiement, le site crée/synchronise automatiquement ses tables
et recharge les races/exercices de base (voir le script `build` dans
`package.json`) — aucune commande à taper.

Un compte administrateur est créé automatiquement :
`admin@clebo.fr` / `ClangeMoiVite123!` (variables `ADMIN_EMAIL` /
`ADMIN_PASSWORD` pour personnaliser — **à changer avant d'avoir de vrais
clients**).

## Développement local (pour un développeur)

```bash
npm install
cp .env.example .env.local   # puis remplir DATABASE_URL avec une base
                              # Postgres (ex: gratuite sur neon.tech)
npm run dev                  # configure le reste automatiquement
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Voir `.env.example`.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Connexion à la base Postgres (fournie automatiquement par Vercel si tu utilises Vercel Postgres) |
| `COOKIE_SIGNING_SECRET` | Secret de signature du cookie de session (ex: `openssl rand -hex 32`) |
| `STRIPE_SECRET_KEY` | Dashboard Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Créé à l'étape "Webhook" ci-dessous |
| `STRIPE_PRICE_ID` | Price Stripe récurrent à 27,99€/mois |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard Stripe → Developers → API keys |
| `ANTHROPIC_API_KEY` | Optionnelle — [console.anthropic.com](https://console.anthropic.com/), active la création de race par IA et la génération d'exercices sur-mesure |
| `YOUTUBE_API_KEY` | Optionnelle — [console.cloud.google.com](https://console.cloud.google.com/apis/library/youtube.googleapis.com), intègre une vraie vidéo sous les exercices sur-mesure générés |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optionnelles — [console.cloud.google.com](https://console.cloud.google.com/apis/credentials), activent "Continuer avec Google" |
| `FREE_ACCESS_EMAILS` | Optionnelle — emails séparés par des virgules ayant accès à tout le site sans passer par Stripe |

## Configuration Stripe

1. Dashboard Stripe → **Product catalog** → **Add product** → nom
   "Clebo Premium", pricing **Recurring**, montant **27,99€**, période
   **Monthly** → copier l'ID du prix (`price_...`) → `STRIPE_PRICE_ID`.
2. Dashboard Stripe → **Developers** → **Webhooks** → **Add endpoint** →
   URL `https://<ton-domaine>/api/webhook`, événements
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted` → copier le **Signing secret**
   (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.
3. Utiliser les clés **Test mode** (`sk_test_...`) et la carte de test
   `4242 4242 4242 4242` pour valider le flux avant la mise en Live.

## Scripts utiles

- `npm run assets:generate` : régénère les illustrations placeholder des
  races et des exercices dans `public/`.
- `npm run db:seed` : recharge les races, exercices et marques de
  nourriture de base (upsert, sans dupliquer).
- `npm run setup` : enchaîne `db:push` + `assets:generate` + `db:seed`.

## Portée du MVP / limites connues

- 15 races pré-chargées (races les plus courantes en France), 10
  exercices de base couvrant les 5 niveaux de dressage. Toute race
  absente peut être créée à la volée par un client (IA). L'architecture
  (Prisma + tables de jointure) permet d'en ajouter sans toucher au code
  applicatif.
- Les images de races/exercices sont des illustrations placeholder
  générées par code (`scripts/generate-*-images.ts`), à remplacer par de
  vraies photos en gardant le même chemin de fichier.
- Le script `build` exécute `prisma db push --accept-data-loss` à chaque
  déploiement pour rester simple pendant le développement initial (pas de
  système de migrations à gérer manuellement). À remplacer par de vraies
  migrations Prisma (`prisma migrate deploy`) une fois le site en
  production avec de vrais clients, pour éviter tout risque de perte de
  données sur un changement de schéma.
