import { jwtVerify, createRemoteJWKSet } from "jose";
import { googleRedirectUri } from "../oauthConfig";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function googleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
}

export class GoogleAuthError extends Error {}

export async function exchangeGoogleCode(code: string): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new GoogleAuthError(`Échange du code Google refusé (${tokenRes.status}).`);
  }
  const tokenJson = (await tokenRes.json()) as { id_token?: string };
  if (!tokenJson.id_token) {
    throw new GoogleAuthError("Réponse Google sans id_token.");
  }

  const { payload } = await jwtVerify(tokenJson.id_token, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: process.env.GOOGLE_CLIENT_ID!,
  });

  const email = typeof payload.email === "string" ? payload.email : null;
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!email || !sub) {
    throw new GoogleAuthError("Jeton Google incomplet (email ou identifiant manquant).");
  }

  return { googleId: sub, email: email.toLowerCase() };
}
