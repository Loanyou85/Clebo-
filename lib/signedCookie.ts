import { createHmac, timingSafeEqual } from "crypto";

// Utilitaire générique de signature de cookie (HMAC). Le secret de
// signature n'est jamais exposé au client : un cookie modifié à la main
// échoue la vérification.

function getSecret(): string {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  if (!secret) {
    throw new Error("COOKIE_SIGNING_SECRET n'est pas configurée.");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSignedValue(data: unknown, maxAgeSeconds: number): string {
  const exp = Date.now() + maxAgeSeconds * 1000;
  const json = JSON.stringify({ data, exp });
  const encoded = Buffer.from(json, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function parseSignedValue<T>(value: string | undefined): T | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { data: T; exp?: unknown };
    if (typeof parsed.exp !== "number" || Date.now() >= parsed.exp) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
