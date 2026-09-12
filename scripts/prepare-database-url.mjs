// Exécuté au tout début du build (voir package.json). Prisma exige une
// variable nommée exactement DATABASE_URL, mais l'intégration Postgres
// de Vercel (Neon) crée ses variables avec le préfixe choisi pendant la
// connexion au projet (ex: POSTGRES_URL, MONPREFIXE_POSTGRES_URL...) —
// un détail d'interface facile à mal configurer. Ce script retrouve tout
// seul la bonne chaîne de connexion parmi les variables déjà présentes
// et l'écrit dans .env sous le nom DATABASE_URL, pour que le reste du
// build (prisma generate / db push / next build) fonctionne sans avoir
// à obtenir un nom de variable exact côté Vercel.
import { appendFileSync, existsSync, readFileSync } from "fs";

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
  console.log("[prepare-database-url] DATABASE_URL déjà définie, rien à faire.");
  process.exit(0);
}

const isPostgresUrl = (value) => typeof value === "string" && /^postgres(ql)?:\/\//i.test(value.trim());

const candidates = Object.entries(process.env).filter(([, value]) => isPostgresUrl(value));

if (candidates.length === 0) {
  console.error(`
[prepare-database-url] Aucune variable de connexion Postgres trouvée.

Vérifie dans Vercel → onglet Storage que la base de données est bien
créée ET connectée à ce projet (bouton "Connect Project"). Le préfixe
choisi pendant cette étape n'a pas d'importance, ce script le détecte
automatiquement.
`);
  process.exit(1);
}

// Priorité : une variable pensée pour Prisma (nom contenant "PRISMA"),
// sinon la plus courte / la plus générique (souvent la bonne, les
// variantes "_NON_POOLING" ou "_UNPOOLED" sont volontairement évitées en
// priorité car moins adaptées à un usage serverless).
function score([key]) {
  const upper = key.toUpperCase();
  if (upper.includes("PRISMA")) return 0;
  if (upper.includes("NON_POOLING") || upper.includes("UNPOOLED")) return 2;
  return 1;
}
candidates.sort((a, b) => score(a) - score(b));

const [chosenKey, chosenValue] = candidates[0];
console.log(`[prepare-database-url] Utilisation de ${chosenKey} comme DATABASE_URL.`);

const envPath = ".env";
const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
if (!existing.includes("DATABASE_URL=")) {
  appendFileSync(envPath, `\nDATABASE_URL="${chosenValue.trim()}"\n`);
}
