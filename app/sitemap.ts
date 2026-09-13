import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";

// Le sitemap est calculé à la demande, jamais figé au moment du build :
// sinon il dépendrait de la base pendant le déploiement (une base
// momentanément injoignable ferait échouer tout le déploiement) et il
// n'inclurait jamais les races créées par les clients après coup.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // Une base injoignable ne doit pas renvoyer une erreur 500 aux robots :
  // on sert au moins les pages fixes.
  const [races, programmes] = await Promise.all([
    prisma.breed.findMany({ select: { slug: true }, orderBy: { name: "asc" } }).catch(() => []),
    prisma.program.findMany({ select: { slug: true }, orderBy: { title: "asc" } }).catch(() => []),
  ]);

  const pagesFixes = [
    { url: "/", priority: 1 },
    { url: "/diagnostic", priority: 0.9 },
    { url: "/programmes", priority: 0.9 },
    { url: "/tarifs", priority: 0.8 },
    { url: "/races", priority: 0.7 },
    { url: "/rations", priority: 0.7 },
    { url: "/a-propos", priority: 0.5 },
    { url: "/contact", priority: 0.4 },
    { url: "/cgv", priority: 0.3 },
    { url: "/confidentialite", priority: 0.3 },
    { url: "/mentions-legales", priority: 0.3 },
  ];

  return [
    ...pagesFixes.map((page) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: new Date(),
      priority: page.priority,
    })),
    ...programmes.map((programme) => ({
      url: `${siteUrl}/programmes/${programme.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...races.map((race) => ({
      url: `${siteUrl}/races/${race.slug}`,
      lastModified: new Date(),
      priority: 0.6,
    })),
  ];
}
