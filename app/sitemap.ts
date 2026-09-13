import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [races, programmes] = await Promise.all([
    prisma.breed.findMany({ select: { slug: true }, orderBy: { name: "asc" } }),
    prisma.program.findMany({ select: { slug: true }, orderBy: { title: "asc" } }),
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
