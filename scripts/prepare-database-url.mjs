#!/usr/bin/env node
// Exécuté au tout début du build (voir package.json, via `eval`). Prisma
// exige des variables nommées exactement DATABASE_URL / DIRECT_DATABASE_URL,
// mais l'intégration Postgres de Vercel (Neon) crée ses variables avec le
// préfixe choisi pendant la connexion au projet (ex: POSTGRES_URL,
// MONPREFIXE_POSTGRES_URL_NON_POOLING...), et une variable DATABASE_URL
// vide peut aussi traîner dans les réglages du projet. Ce script imprime
// sur stdout des lignes `export KEY="valeur"` que le script "build" évalue
// directement dans le SHELL qui lance prisma/next — c'est nécessaire car
// un fichier .env n'écrase jamais une variable déjà définie (même vide),
// alors qu'un `export` dans le même shell, si.
//
// Tous les messages d'information vont sur stderr (jamais stdout, pour ne
// jamais être accidentellement exécutés par le `eval`).
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
  return [...candidates].sort((a, b) => score(a) - score(b))[0];
}

const currentIsValid = isPostgresUrl(process.env.DATABASE_URL);
const pooled = currentIsValid ? null : pick(true);

if (!currentIsValid && !pooled) {
  console.error(`
[prepare-database-url] Aucune variable de connexion Postgres trouvée.

Vérifie dans Vercel → onglet Storage que la base de données est bien
créée ET connectée à ce projet (bouton "Connect Project"), avec
l'environnement "Production" coché. Le préfixe choisi pendant cette
étape n'a pas d'importance, ce script le détecte automatiquement.
`);
  process.exit(1);
}

const currentDirectIsValid = isPostgresUrl(process.env.DIRECT_DATABASE_URL);
const direct = currentDirectIsValid ? null : pick(false);

const exports = [];
if (pooled) {
  console.error(`[prepare-database-url] Utilisation de ${pooled[0]} comme DATABASE_URL (poolée, pour l'application).`);
  exports.push(["DATABASE_URL", pooled[1].trim()]);
}
if (!currentDirectIsValid) {
  const chosen = direct ?? pooled ?? [null, process.env.DATABASE_URL];
  if (direct) {
    console.error(
      `[prepare-database-url] Utilisation de ${direct[0]} comme DIRECT_DATABASE_URL (directe, pour prisma db push).`
    );
  }
  exports.push(["DIRECT_DATABASE_URL", chosen[1].trim()]);
}

for (const [key, value] of exports) {
  // Échappement simple pour une valeur entre apostrophes en shell POSIX.
  const escaped = value.replace(/'/g, `'\\''`);
  console.log(`export ${key}='${escaped}'`);
}
