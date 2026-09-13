/**
 * URL publique du site, résolue de façon robuste.
 *
 * Une variable d'environnement définie mais VIDE est le piège classique de
 * ce projet : `process.env.X ?? "défaut"` renvoie alors la chaîne vide (le
 * `??` ne rattrape que `undefined`/`null`), ce qui faisait planter le build
 * entier sur `new URL("")`. On traite donc explicitement le vide comme une
 * absence, et on se rabat sur les variables que Vercel fournit toujours
 * lui-même avant de finir sur localhost.
 */
function premiereValeurUtile(...valeurs: Array<string | undefined>): string | null {
  for (const valeur of valeurs) {
    const nettoyee = valeur?.trim();
    if (nettoyee) return nettoyee;
  }
  return null;
}

export function getSiteUrl(): string {
  const brute = premiereValeurUtile(
    process.env.NEXT_PUBLIC_SITE_URL,
    // Fournies automatiquement par Vercel : le site reste fonctionnel même
    // si NEXT_PUBLIC_SITE_URL n'a jamais été renseignée.
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL
  );

  if (!brute) return "http://localhost:3000";

  const avecProtocole = /^https?:\/\//i.test(brute) ? brute : `https://${brute}`;
  return avecProtocole.replace(/\/+$/, "");
}
