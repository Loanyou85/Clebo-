// Exécuté au tout début du build (voir package.json). Prisma exige des
// variables nommées exactement DATABASE_URL / DIRECT_DATABASE_URL, mais
// l'intégration Postgres de Vercel (Neon) crée ses variables avec le
// préfixe choisi pendant la connexion au projet (ex: POSTGRES_URL,
// MONPREFIXE_POSTGRES_URL_NON_POOLING...) — un détail d'interface facile
// à mal configurer. Ce script retrouve tout seul les bonnes chaînes de
// connexion parmi les variables déjà présentes et les écrit dans .env,
// pour que le reste du build (prisma generate / db push / next build)
// fonctionne sans avoir à obtenir un nom de variable exact côté Vercel.
//
// Deux variables distinctes sont nécessaires : les intégrations Postgres
// serverless (Neon) fournissent une connexion "poolée" (via PgBouncer)
// pour l'application, mais `prisma db push` a besoin d'une connexion
// directe pour modifier le schéma — sans quoi il échoue souvent avec des
// erreurs peu claires à cause du mode transaction du pooler.
import { appendFileSync, existsSync, readFileSync } from "fs";

const isPostgresUrl = (value) => typeof value === "string" && /^postgres(ql)?:\/\//i.test(value.trim());

const candidates = Object.entries(process.env).filter(([, value]) => isPostgresUrl(value));

function pick(preferPooled) {
  if (candidates.length === 0) return null;
  function score([key]) {
    const upper = key.toUpperCase();
    const isDirect = upper.includes("NON_POOLING") || upper.includes("UNPOOLED") || upper.includes("DIRECT");
    if (preferPooled) {
      if (upper.includes("PRISMA")) return 0;
      if (isDirect) return 2;
      return 1;
    }
    if (isDirect) return 0;
    if (upper.includes("PRISMA")) return 2;
    return 1;
  }
  const sorted = [...candidates].sort((a, b) => score(a) - score(b));
  return sorted[0];
}

const pooled = process.env.DATABASE_URL && isPostgresUrl(process.env.DATABASE_URL) ? null : pick(true);
const direct =
  process.env.DIRECT_DATABASE_URL && isPostgresUrl(process.env.DIRECT_DATABASE_URL) ? null : pick(false);

if (!process.env.DATABASE_URL && !pooled) {
  console.error(`
[prepare-database-url] Aucune variable de connexion Postgres trouvée.

Vérifie dans Vercel → onglet Storage que la base de données est bien
créée ET connectée à ce projet (bouton "Connect Project"). Le préfixe
choisi pendant cette étape n'a pas d'importance, ce script le détecte
automatiquement.
`);
  process.exit(1);
}

const lines = [];
if (pooled) {
  console.log(`[prepare-database-url] Utilisation de ${pooled[0]} comme DATABASE_URL (poolée, pour l'application).`);
  lines.push(`DATABASE_URL="${pooled[1].trim()}"`);
}
if (direct) {
  console.log(
    `[prepare-database-url] Utilisation de ${direct[0]} comme DIRECT_DATABASE_URL (directe, pour prisma db push).`
  );
  lines.push(`DIRECT_DATABASE_URL="${direct[1].trim()}"`);
} else if (!process.env.DIRECT_DATABASE_URL) {
  // Pas de connexion directe distincte trouvée : on retombe sur la même
  // URL que DATABASE_URL plutôt que d'échouer — ça fonctionne dans la
  // plupart des cas (ex: Postgres local, ou fournisseur sans pooler).
  const fallback = pooled ?? [null, process.env.DATABASE_URL];
  lines.push(`DIRECT_DATABASE_URL="${fallback[1].trim()}"`);
}

if (lines.length > 0) {
  const envPath = ".env";
  const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const toAppend = lines.filter((line) => !existing.includes(line.split("=")[0] + "="));
  if (toAppend.length > 0) {
    appendFileSync(envPath, `\n${toAppend.join("\n")}\n`);
  }
}
