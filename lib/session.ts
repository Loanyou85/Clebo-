import { createSignedValue, parseSignedValue } from "./signedCookie";

// Session utilisateur signée (httpOnly, 30 jours). Ne contient QUE
// l'identifiant utilisateur — jamais le statut d'abonnement, qui vit en
// base (mis à jour par le webhook Stripe) et est relu à chaque contrôle
// d'accès côté serveur, jamais fait confiance depuis le cookie seul.

export const SESSION_COOKIE_NAME = "clebo_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface SessionPayload {
  userId: string;
}

export function createSessionCookieValue(payload: SessionPayload): string {
  return createSignedValue(payload, SESSION_MAX_AGE_SECONDS);
}

export function parseSessionCookie(value: string | undefined): SessionPayload | null {
  const data = parseSignedValue<Partial<SessionPayload>>(value);
  if (!data || typeof data.userId !== "string" || !data.userId) return null;
  return { userId: data.userId };
}
