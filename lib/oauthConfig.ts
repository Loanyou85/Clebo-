import { getSiteUrl as siteUrl } from "./siteUrl";

export function googleRedirectUri(): string {
  return `${siteUrl()}/api/auth/google/callback`;
}

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
