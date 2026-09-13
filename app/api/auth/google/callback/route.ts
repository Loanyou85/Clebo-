import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeGoogleCode, GoogleAuthError } from "@/lib/oauth/google";
import { findOrCreateOAuthUser } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSessionCookieValue } from "@/lib/session";
import { OAUTH_STATE_COOKIE_NAME, verifyOAuthState } from "@/lib/oauthState";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  const cookieStore = await cookies();
  const verified = verifyOAuthState(cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value, returnedState);
  cookieStore.delete(OAUTH_STATE_COOKIE_NAME);

  if (!code || !verified) {
    return NextResponse.redirect(`${origin}/connexion?error=oauth_echec`);
  }

  try {
    const profile = await exchangeGoogleCode(code);
    const user = await findOrCreateOAuthUser(profile.googleId, profile.email);

    cookieStore.set(SESSION_COOKIE_NAME, createSessionCookieValue({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return NextResponse.redirect(`${origin}${verified.next}`);
  } catch (error) {
    if (!(error instanceof GoogleAuthError)) {
      console.error("Erreur de connexion Google:", error);
    }
    return NextResponse.redirect(`${origin}/connexion?error=oauth_echec`);
  }
}
