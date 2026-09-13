import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
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
