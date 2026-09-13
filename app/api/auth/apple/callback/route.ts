import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeAppleCode, AppleAuthError } from "@/lib/oauth/apple";
import { findOrCreateOAuthUser } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSessionCookieValue } from "@/lib/session";
import { OAUTH_STATE_COOKIE_NAME, verifyOAuthState } from "@/lib/oauthState";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const form = await request.formData().catch(() => null);
  const code = form?.get("code");
  const returnedState = form?.get("state");

  const cookieStore = await cookies();
  const verified = verifyOAuthState(
    cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value,
    typeof returnedState === "string" ? returnedState : null
  );
  cookieStore.delete(OAUTH_STATE_COOKIE_NAME);

  if (typeof code !== "string" || !verified) {
    return NextResponse.redirect(`${origin}/connexion?error=oauth_echec`, { status: 303 });
  }

  try {
    const profile = await exchangeAppleCode(code);
    const user = await findOrCreateOAuthUser("apple", profile.appleId, profile.email);

    cookieStore.set(SESSION_COOKIE_NAME, createSessionCookieValue({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return NextResponse.redirect(`${origin}${verified.next}`, { status: 303 });
  } catch (error) {
    if (!(error instanceof AppleAuthError)) {
      console.error("Erreur de connexion Apple:", error);
    }
    return NextResponse.redirect(`${origin}/connexion?error=oauth_echec`, { status: 303 });
  }
}
