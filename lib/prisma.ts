import { PrismaClient } from "@prisma/client";
import { ensureDatabaseUrl } from "./resolveDatabaseUrl";

ensureDatabaseUrl();

// Singleton client Prisma : évite d'ouvrir une nouvelle connexion à chaque
// rechargement à chaud en dev (Next.js recharge les modules serveur).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
