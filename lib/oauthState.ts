import { randomBytes } from "crypto";
import { createSignedValue, parseSignedValue } from "./signedCookie";

// Cookie signé et de très courte durée de vie, posé juste avant de
// rediriger vers Google : protège contre le CSRF (le state renvoyé
// par le fournisseur doit correspondre) et retient la page vers laquelle
// revenir une fois connecté.

export const OAUTH_STATE_COOKIE_NAME = "clebo_oauth_state";
export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

export interface OAuthStatePayload {
  state: string;
  next: string;
}

export function createOAuthState(next: string): { cookieValue: string; state: string } {
  const state = randomBytes(16).toString("hex");
  const cookieValue = createSignedValue({ state, next } satisfies OAuthStatePayload, OAUTH_STATE_MAX_AGE_SECONDS);
  return { cookieValue, state };
}

export function verifyOAuthState(
  cookieValue: string | undefined,
  receivedState: string | null
): OAuthStatePayload | null {
  const payload = parseSignedValue<Partial<OAuthStatePayload>>(cookieValue);
  if (!payload || typeof payload.state !== "string" || typeof payload.next !== "string") return null;
  if (!receivedState || receivedState !== payload.state) return null;
  return { state: payload.state, next: payload.next };
}

// Empêche une redirection ouverte : "next" ne peut être qu'un chemin
// interne relatif (jamais une URL absolue fournie par le paramètre de requête).
export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}
