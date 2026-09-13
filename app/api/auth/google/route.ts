import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { googleAuthUrl } from "@/lib/oauth/google";
import { isGoogleConfigured } from "@/lib/oauthConfig";
import { createOAuthState, OAUTH_STATE_COOKIE_NAME, OAUTH_STATE_MAX_AGE_SECONDS, sanitizeNextPath } from "@/lib/oauthState";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeNextPath(searchParams.get("next"));

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${origin}/connexion?error=google_indisponible`);
  }

  const { cookieValue, state } = createOAuthState(next);
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });

  return NextResponse.redirect(googleAuthUrl(state));
}
