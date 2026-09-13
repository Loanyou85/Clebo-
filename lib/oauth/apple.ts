import { SignJWT, jwtVerify, createRemoteJWKSet, importPKCS8 } from "jose";
import { appleRedirectUri } from "../oauthConfig";

const APPLE_JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export function appleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: appleRedirectUri(),
    response_type: "code",
    scope: "name email",
    response_mode: "form_post",
    state,
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

// Le "client secret" d'Apple n'est pas une chaîne fixe : c'est un JWT signé
// en ES256 avec la clé privée téléchargée depuis le Apple Developer Portal
// (clé "Sign in with Apple"), régénéré à chaque échange de code — il n'a
// besoin de vivre que quelques minutes.
async function generateAppleClientSecret(): Promise<string> {
  const rawKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(rawKey, "ES256");

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setSubject(process.env.APPLE_CLIENT_ID!)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

export interface AppleProfile {
  appleId: string;
  email: string;
}

export class AppleAuthError extends Error {}

export async function exchangeAppleCode(code: string): Promise<AppleProfile> {
  const clientSecret = await generateAppleClientSecret();

  const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.APPLE_CLIENT_ID!,
      client_secret: clientSecret,
      redirect_uri: appleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new AppleAuthError(`Échange du code Apple refusé (${tokenRes.status}).`);
  }
  const tokenJson = (await tokenRes.json()) as { id_token?: string };
  if (!tokenJson.id_token) {
    throw new AppleAuthError("Réponse Apple sans id_token.");
  }

  const { payload } = await jwtVerify(tokenJson.id_token, APPLE_JWKS, {
    issuer: "https://appleid.apple.com",
    audience: process.env.APPLE_CLIENT_ID!,
  });

  const email = typeof payload.email === "string" ? payload.email : null;
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!email || !sub) {
    throw new AppleAuthError("Jeton Apple incomplet (email ou identifiant manquant).");
  }

  return { appleId: sub, email: email.toLowerCase() };
}
