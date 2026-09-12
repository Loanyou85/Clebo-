import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, parseSessionCookie } from "@/lib/session";

// Garde de route serveur (proxy.ts remplace middleware.ts depuis Next 16,
// voir node_modules/next/dist/docs). Vérifie le cookie de session httpOnly
// signé sur chaque requête vers ces routes, avant même que la page ne
// s'exécute : impossible à contourner en modifiant le localStorage.
//
// Le contrôle d'abonnement (accès aux contenus premium) est fait plus
// finement à l'intérieur de chaque page/route via lib/auth.ts
// (isActiveSubscription), pas ici, car il dépend de la donnée en base.
const LOGGED_OUT_ONLY = new Set(["/inscription", "/connexion"]);
const REQUIRES_LOGIN = [
  "/dashboard",
  "/chiens",
  "/alimentation",
  "/demandes-exercices",
  "/admin",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (LOGGED_OUT_ONLY.has(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const needsLogin = REQUIRES_LOGIN.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (needsLogin && !session) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inscription",
    "/connexion",
    "/dashboard/:path*",
    "/chiens/:path*",
    "/alimentation/:path*",
    "/demandes-exercices/:path*",
    "/admin/:path*",
  ],
};
