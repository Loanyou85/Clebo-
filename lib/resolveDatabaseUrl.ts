// Garantit que process.env.DATABASE_URL est renseignée avant toute
// utilisation de Prisma, même si l'intégration Postgres du fournisseur
// d'hébergement (Vercel + Neon) a créé sa variable sous un autre nom
// (POSTGRES_URL, <préfixe>_POSTGRES_URL...) suite à un préfixe personnalisé
// mal renseigné pendant la connexion de la base au projet. Sans ce filet,
// une simple erreur de configuration dans l'interface Vercel fait planter
// tout le site en production avec une erreur Prisma peu explicite.
function isPostgresUrl(value: string | undefined): value is string {
  return !!value && /^postgres(ql)?:\/\//i.test(value.trim());
}

function score(key: string): number {
  const upper = key.toUpperCase();
  if (upper.includes("PRISMA")) return 0;
  if (upper.includes("NON_POOLING") || upper.includes("UNPOOLED")) return 2;
  return 1;
}

export function ensureDatabaseUrl(): void {
  if (isPostgresUrl(process.env.DATABASE_URL)) return;

  const candidates = Object.entries(process.env).filter(
    (entry): entry is [string, string] => isPostgresUrl(entry[1])
  );
  if (candidates.length === 0) return;

  candidates.sort((a, b) => score(a[0]) - score(b[0]));
  process.env.DATABASE_URL = candidates[0][1].trim();
}
