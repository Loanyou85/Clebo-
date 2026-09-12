// Lancé automatiquement avant `npm run dev` (hook npm "predev").
// Le projet utilise Postgres (nécessaire pour le déploiement en
// production, voir prisma/schema.prisma) : contrairement à SQLite, une
// vraie base doit exister avant de pouvoir développer localement. Ce
// script prépare tout le reste automatiquement (secret de session,
// images placeholder, schéma + seed) dès que DATABASE_URL est configuré.
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { randomBytes } from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envLocalPath = join(ROOT, ".env.local");
const envPath = join(ROOT, ".env");

function run(cmd) {
  console.log(`[dev-setup] ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function hasValue(content, key) {
  const line = content.split("\n").find((l) => l.startsWith(`${key}=`));
  return !!line && line.slice(key.length + 1).trim().length > 0;
}

// 1. .env.local : le créer si absent, avec un secret de session généré.
// DATABASE_URL reste vide ici : il n'y a pas de base par défaut possible
// sans base externe (voir README pour obtenir une base Postgres gratuite
// en 2 minutes, ex: Neon ou Vercel Postgres).
if (!existsSync(envLocalPath)) {
  console.log("[dev-setup] .env.local absent, création...");
  const secret = randomBytes(32).toString("hex");
  writeFileSync(
    envLocalPath,
    `# Colle ici l'URL de connexion d'une base Postgres (Neon, Vercel Postgres...)
DATABASE_URL=
COOKIE_SIGNING_SECRET=${secret}

# Stripe (optionnel en dev : sans ces valeurs, tout le site fonctionne sauf
# le paiement réel). Voir README pour la configuration complète.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
`,
    "utf8"
  );
}

// 2. .env : Prisma CLI ne lit que .env, jamais .env.local.
const envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
if (!envContent || !hasValue(envContent, "COOKIE_SIGNING_SECRET")) {
  copyFileSync(envLocalPath, envPath);
}

const finalEnv = readFileSync(envPath, "utf8");
if (!hasValue(finalEnv, "DATABASE_URL")) {
  console.log(`
[dev-setup] ⚠ DATABASE_URL n'est pas configurée dans .env / .env.local.
Ce projet a besoin d'une vraie base Postgres, même en développement
(SQLite ne fonctionne pas en production sur un hébergeur serverless).

Option la plus rapide : créer une base gratuite sur https://neon.tech
(ou https://vercel.com/storage/postgres), copier son "Connection string",
et la coller dans DATABASE_URL= (fichier .env.local à la racine du projet).
Relance ensuite "npm run dev".
`);
  process.exit(1);
}

run("npx prisma generate");
run("npx prisma db push");
run("npx tsx scripts/generate-breed-images.ts");
run("npx tsx scripts/generate-exercise-images.ts");
run("npx tsx prisma/seed.ts");

console.log("[dev-setup] Prêt.");
