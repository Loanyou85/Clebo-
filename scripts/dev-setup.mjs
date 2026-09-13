// Lancé automatiquement avant `npm run dev` (hook npm "predev").
// Le projet utilise Postgres (nécessaire pour le déploiement en
// production, voir prisma/schema.prisma) : contrairement à SQLite, une
// vraie base doit exister avant de pouvoir développer localement.
//
// Next.js lit .env.local en PRIORITÉ sur .env : si les deux fichiers
// existent avec des valeurs différentes (ex: .env.local créé avec un
// DATABASE_URL vide pendant qu'un .env valide existait déjà), Next.js
// utilise silencieusement la version vide de .env.local et écrase la
// bonne valeur de .env — c'est exactement le bug qui a cassé le
// déploiement Vercel (variable vide qui prime sur la bonne), reproduit
// ici en local avec deux fichiers .env différents. Pour ne plus jamais
// avoir ce problème, ce script fusionne .env.local et .env en un seul
// jeu de valeurs cohérent, puis réécrit CE MÊME contenu dans les deux
// fichiers : ils ne peuvent plus se contredire.
import { existsSync, readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envLocalPath = join(ROOT, ".env.local");
const envPath = join(ROOT, ".env");

function run(cmd) {
  console.log(`[dev-setup] ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit", env: process.env });
}

function parseEnv(content) {
  const values = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    values[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

const KEYS = [
  "DATABASE_URL",
  "DIRECT_DATABASE_URL",
  "COOKIE_SIGNING_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

const fromEnvLocal = existsSync(envLocalPath) ? parseEnv(readFileSync(envLocalPath, "utf8")) : {};
const fromEnv = existsSync(envPath) ? parseEnv(readFileSync(envPath, "utf8")) : {};

// Fusion : la première valeur non vide gagne, peu importe le fichier.
const merged = {};
for (const key of KEYS) {
  merged[key] = fromEnvLocal[key] || fromEnv[key] || "";
}
if (!merged.COOKIE_SIGNING_SECRET) merged.COOKIE_SIGNING_SECRET = randomBytes(32).toString("hex");
if (!merged.NEXT_PUBLIC_SITE_URL) merged.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
if (!merged.DIRECT_DATABASE_URL) merged.DIRECT_DATABASE_URL = merged.DATABASE_URL;

if (!merged.DATABASE_URL) {
  console.log(`
[dev-setup] ⚠ DATABASE_URL n'est pas configurée.
Ce projet a besoin d'une vraie base Postgres, même en développement
(SQLite ne fonctionne pas en production sur un hébergeur serverless).

Option la plus rapide : créer une base gratuite sur https://neon.tech
(ou https://vercel.com/storage/postgres), copier son "Connection string",
et la coller dans DATABASE_URL= (fichier .env.local à la racine du projet).
Relance ensuite "npm run dev".
`);
  process.exit(1);
}

const rendered = `DATABASE_URL="${merged.DATABASE_URL}"
DIRECT_DATABASE_URL="${merged.DIRECT_DATABASE_URL}"
COOKIE_SIGNING_SECRET=${merged.COOKIE_SIGNING_SECRET}

# Stripe (optionnel en dev : sans ces valeurs, tout le site fonctionne sauf
# le paiement réel). Voir README pour la configuration complète.
STRIPE_SECRET_KEY=${merged.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${merged.STRIPE_WEBHOOK_SECRET}
STRIPE_PRICE_ID=${merged.STRIPE_PRICE_ID}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${merged.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}

NEXT_PUBLIC_SITE_URL=${merged.NEXT_PUBLIC_SITE_URL}
`;

// Les deux fichiers reçoivent exactement le même contenu : plus aucun
// risque qu'ils se contredisent silencieusement.
writeFileSync(envLocalPath, rendered, "utf8");
writeFileSync(envPath, rendered, "utf8");

for (const key of ["DATABASE_URL", "DIRECT_DATABASE_URL", "COOKIE_SIGNING_SECRET", "NEXT_PUBLIC_SITE_URL"]) {
  process.env[key] = merged[key];
}

run("npx prisma generate");
run("npx prisma db push");
run("npx tsx scripts/generate-breed-images.ts");
run("npx tsx scripts/generate-exercise-images.ts");
run("npx tsx prisma/seed.ts");

console.log("[dev-setup] Prêt.");
