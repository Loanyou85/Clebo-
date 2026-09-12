// Lancé automatiquement avant `npm run dev` (hook npm "predev"), pour que
// `npm install && npm run dev` fonctionne dès le premier essai, sans étape
// manuelle oubliée (.env manquant, base de données jamais créée...) qui
// provoquerait un écran blanc silencieux.
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { randomBytes } from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envLocalPath = join(ROOT, ".env.local");
const envPath = join(ROOT, ".env");
const dbPath = join(ROOT, "prisma", "dev.db");

function run(cmd) {
  console.log(`[dev-setup] ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

// 1. .env.local : le créer avec des valeurs de dev qui marchent tout de
// suite si absent (jamais écraser un fichier existant, même incomplet).
if (!existsSync(envLocalPath)) {
  console.log("[dev-setup] .env.local absent, création avec des valeurs de développement...");
  const secret = randomBytes(32).toString("hex");
  writeFileSync(
    envLocalPath,
    `DATABASE_URL="file:./dev.db"
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

// 2. .env : Prisma CLI ne lit que .env, jamais .env.local. On le garde
// synchronisé avec .env.local s'il n'existe pas encore ou si une valeur
// requise y est manquante/vide (ex: COOKIE_SIGNING_SECRET= sans valeur).
function hasValue(content, key) {
  const line = content.split("\n").find((l) => l.startsWith(`${key}=`));
  return !!line && line.slice(key.length + 1).trim().length > 0;
}

const envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const needsEnvCopy =
  !envContent || !hasValue(envContent, "DATABASE_URL") || !hasValue(envContent, "COOKIE_SIGNING_SECRET");

if (needsEnvCopy) {
  copyFileSync(envLocalPath, envPath);
}

// 3. Base de données : la créer et la peupler si elle n'existe pas encore.
if (!existsSync(dbPath)) {
  console.log("[dev-setup] Base de données absente, initialisation...");
  run("npx prisma db push");
  run("npx tsx scripts/generate-breed-images.ts");
  run("npx tsx scripts/generate-exercise-images.ts");
  run("npx tsx prisma/seed.ts");
} else {
  run("npx prisma generate");
}

console.log("[dev-setup] Prêt.");
