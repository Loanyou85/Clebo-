import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appleAuthUrl } from "@/lib/oauth/apple";
import { isAppleConfigured } from "@/lib/oauthConfig";
import { createOAuthState, OAUTH_STATE_COOKIE_NAME, OAUTH_STATE_MAX_AGE_SECONDS, sanitizeNextPath } from "@/lib/oauthState";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeNextPath(searchParams.get("next"));

  if (!isAppleConfigured()) {
    return NextResponse.redirect(`${origin}/connexion?error=apple_indisponible`);
  }

  const { cookieValue, state } = createOAuthState(next);
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    // Le retour d'Apple est un POST cross-site (response_mode=form_post) :
    // un cookie SameSite=Lax ne serait pas envoyé avec cette requête.
    // SameSite=None exige Secure, ce qui veut aussi dire que ce flux ne
    // peut pas fonctionner en dev local en http — c'est aussi une
    // exigence d'Apple elle-même (redirect_uri doit être en https).
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });

  return NextResponse.redirect(appleAuthUrl(state));
}
