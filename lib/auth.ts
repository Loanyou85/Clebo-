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

// Connexion via Google/Apple : réutilise un compte existant plutôt que
// d'en créer un doublon dès que l'email correspond déjà (ex: le client
// s'était d'abord inscrit par email/mot de passe) — l'email étant garanti
// vérifié par le fournisseur, on lie simplement l'identifiant du
// fournisseur à ce compte au lieu de bloquer la connexion.
export async function findOrCreateOAuthUser(
  provider: "google" | "apple",
  providerId: string,
  email: string
): Promise<User> {
  const byProviderId =
    provider === "google"
      ? await prisma.user.findUnique({ where: { googleId: providerId } })
      : await prisma.user.findUnique({ where: { appleId: providerId } });
  if (byProviderId) return byProviderId;

  const byEmail = await prisma.user.findUnique({ where: { email } });
  const providerData = provider === "google" ? { googleId: providerId } : { appleId: providerId };

  if (byEmail) {
    return prisma.user.update({ where: { id: byEmail.id }, data: providerData });
  }

  return prisma.user.create({ data: { email, ...providerData } });
}
