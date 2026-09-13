# Clebo

Clebo est un SaaS français de dressage canin. Il ne vend pas du contenu —
celui-ci est déjà gratuit et abondant sur YouTube — mais **un cadre, un
suivi et une correction** : un diagnostic qui personnalise, un programme
daté de 30 jours qu'on ne peut pas sauter, et un journal qui mesure la
progression du chien.

**Modèle économique**

| Niveau | Prix | Contenu |
|---|---|---|
| Gratuit | 0 € | Diagnostic et plan personnalisé, 3 premiers jours de n'importe quel programme, fiches de race, calculateur de rations |
| Programme (offre principale) | **59 € une fois, accès à vie** | Un programme complet de 30 jours, journal de séances, courbe de progression |
| Suivi Clebo (option) | 14,99 €/mois | Tous les programmes, exercices sur-mesure générés par IA, nouveaux contenus |

**Exclusion produit, non négociable** : Clebo ne traite aucun cas
d'agressivité, de morsure ou de réactivité. Ces mots-clés détectés dans le
diagnostic (côté client ET côté serveur, voir `lib/securite.ts`) font
sortir du tunnel de vente vers `/diagnostic/securite`, qui renvoie vers un
professionnel en présentiel et n'affiche aucun bouton d'achat.

## Fonctionnalités

- **Diagnostic d'entrée** (`lib/diagnostic.ts`, `components/Diagnostic.tsx`) :
  6 questions, une par écran, **sans compte**. La première question est le
  hero de la page d'accueil : le visiteur agit dans les deux premières
  secondes. En sortie, un plan personnalisé avec le programme recommandé et
  ses 3 premières séances en clair, le reste flouté. Le compte n'est
  demandé qu'à cet instant, pour sauvegarder le plan.
- **Programmes datés** (`Program`, `ProgramDay`) : 5 programmes de 30 jours
  (laisse, rappel, solitude, propreté, sauts). Chaque jour : un objectif en
  une phrase, un exercice de 5-15 min, les répétitions, l'erreur classique
  à éviter, une vidéo. Les jours futurs sont verrouillés — on ne saute pas
  le jour 12 — et le contrôle est refait côté serveur, pas seulement à
  l'affichage.
- **Journal et courbe de progression** (`SessionLog`, `components/ProgressChart.tsx`) :
  après chaque séance, une seule question — « combien de réussites sur
  10 ? ». La courbe est ce qui fait tenir quand la motivation baisse.
- **Achat unique Stripe** (`mode: "payment"`) : le montant est envoyé en
  `price_data`, donc **aucun prix à créer dans le tableau de bord Stripe**.
  Le webhook crée l'accès à vie (`Purchase`), sans doublon ni échec en
  boucle si Stripe rejoue l'évènement.
- **Génération du contenu par IA** : les 150 séances sont générées par
  Claude (`lib/programGeneration.ts`), pilotable **depuis `/admin` par lots
  de 10** (un lot par clic : générer 30 séances dépasserait la durée
  maximale d'une fonction serverless). Un programme n'est mis en vente
  qu'une fois complet. Script CLI équivalent : `npm run programs:generate`.
- **Comptes utilisateurs** : inscription/connexion par email + mot de
  passe ou « Continuer avec Google », session httpOnly signée (30 jours).
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
- **Rations** (`/rations`) : calculateur de croquettes, de repas et d'eau
  par jour (`lib/feeding.ts`). Gratuit, sans compte et indexable : c'est
  une porte d'entrée SEO.
- **Contenu premium gardé côté serveur** : l'accès à un programme est
  décidé en base par `lib/programAccess.ts` (achat unique, abonnement
  actif, ou liste blanche `FREE_ACCESS_EMAILS`) — jamais depuis le client.

## Direction artistique

Carnet d'entraînement : sportif, concret, consulté dehors sur un téléphone
avec une main occupée par la laisse. Six valeurs, pas une de plus
(`app/globals.css`) : `--encre`, `--papier`, `--foret`, `--signal`,
`--brume`, `--craie`. Titres en Bricolage Grotesque, texte en Inter Tight.

L'orange `--signal` est réservé à **l'action et à la progression** : s'il
est orange, soit on clique dessus, soit ça mesure un avancement. Le seul
élément décoratif autorisé est la ligne de progression
(`components/ProgressLine.tsx`), précisément parce qu'elle porte une
information.

Contraste AA : le texte des boutons orange est en `--encre` (du blanc sur
`--signal` ne passe pas AA), et `--signal-texte` sert à l'orange en texte
sur papier. Toutes les animations (Motion) respectent
`prefers-reduced-motion`, y compris la section à scroll figé de l'accueil
qui bascule alors en simple liste.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript, Tailwind CSS v4
- Prisma + Postgres (dev et prod — nécessaire car le site est destiné à
  être déployé sur un hébergeur serverless, où un fichier SQLite ne
  persisterait pas entre deux déploiements)
- Stripe Checkout : `mode: "payment"` pour l'achat unique d'un programme,
  `mode: "subscription"` pour l'option Suivi Clebo, un seul webhook pour
  les deux
- Motion (ex Framer Motion) pour les animations
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
   - `SITE_URL` → **ne la crée pas encore** : tu l'ajouteras à l'étape 5
     avec l'adresse donnée par Vercel. Ne crée jamais une variable vide —
     une variable définie mais vide n'est pas la même chose qu'une
     variable absente, et c'est une source classique de build cassé (le
     code s'en protège désormais, mais la règle reste valable pour toutes
     les variables).
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
   Variables**, ajoute `SITE_URL` avec cette adresse (sans slash final),
   puis clique **Redeploy** (onglet **Deployments** → "..." sur le dernier
   déploiement → **Redeploy**).

   Le nom `SITE_URL` est volontairement sans préfixe `NEXT_PUBLIC_` : cette
   valeur ne sert que côté serveur, Vercel avertit à juste titre quand on
   expose inutilement une variable au navigateur. Si la variable manque,
   le site se rabat automatiquement sur l'adresse fournie par Vercel — mais
   cette adresse change à chaque déploiement, ce qui perturberait les
   retours de paiement Stripe et la connexion Google.

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
| `STRIPE_PRICE_ID` | Price Stripe récurrent à 14,99 €/mois (option Suivi Clebo). L'achat de programme à 59 € n'a besoin d'aucun price : le montant est envoyé par le code |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard Stripe → Developers → API keys |
| `ANTHROPIC_API_KEY` | Optionnelle — [console.anthropic.com](https://console.anthropic.com/), active la création de race par IA et la génération d'exercices sur-mesure |
| `YOUTUBE_API_KEY` | Optionnelle — [console.cloud.google.com](https://console.cloud.google.com/apis/library/youtube.googleapis.com), intègre une vraie vidéo sous les exercices sur-mesure générés |
| `SITE_URL` | URL publique du site, ex `https://clebo.vercel.app` (sans préfixe `NEXT_PUBLIC_` : la valeur ne sert que côté serveur). Facultative : le site retombe sinon sur l’adresse fournie par Vercel |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optionnelles — [console.cloud.google.com](https://console.cloud.google.com/apis/credentials), activent "Continuer avec Google" |
| `FREE_ACCESS_EMAILS` | Optionnelle — emails séparés par des virgules ayant accès à tout le site sans passer par Stripe |

## Configuration Stripe

1. Rien à créer pour l'offre principale : le programme à 59 € est envoyé
   directement par le code (`price_data`). Uniquement si tu veux activer
   l'option d'abonnement : Dashboard Stripe → **Product catalog** → **Add
   product** → nom "Suivi Clebo", pricing **Recurring**, montant
   **14,99 €**, période **Monthly** → copier l'ID du prix (`price_...`) →
   `STRIPE_PRICE_ID`.
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
