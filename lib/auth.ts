import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { SESSION_COOKIE_NAME, parseSessionCookie } from "./session";
import type { User } from "@prisma/client";

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Relit l'utilisateur courant depuis la base à partir du cookie de
// session — jamais depuis des données mises en cache côté client.
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = parseSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export function isActiveSubscription(user: Pick<User, "subscriptionStatus">): boolean {
  return user.subscriptionStatus === "ACTIVE";
}

// Connexion via Google : réutilise un compte existant plutôt que d'en
// créer un doublon dès que l'email correspond déjà (ex: le client s'était
// d'abord inscrit par email/mot de passe) — l'email étant garanti vérifié
// par Google, on lie simplement son identifiant à ce compte au lieu de
// bloquer la connexion.
export async function findOrCreateOAuthUser(googleId: string, email: string): Promise<User> {
  const byGoogleId = await prisma.user.findUnique({ where: { googleId } });
  if (byGoogleId) return byGoogleId;

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    return prisma.user.update({ where: { id: byEmail.id }, data: { googleId } });
  }

  return prisma.user.create({ data: { email, googleId } });
}
