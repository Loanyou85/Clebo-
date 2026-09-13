import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'espace connecté et l'administration n'ont rien à faire dans un
      // index de moteur de recherche.
      disallow: ["/app", "/admin", "/api", "/chiens", "/demandes-exercices"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
