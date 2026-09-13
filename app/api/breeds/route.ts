import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { generateBreedProfile, BreedGenerationUnavailableError } from "@/lib/breedGeneration";

const bodySchema = z.object({
  name: z.string().trim().min(2, "Nom de race trop court.").max(80),
});

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || "race";
  let suffix = 2;
  while (await prisma.breed.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Nom invalide." },
      { status: 400 }
    );
  }
  const { name } = parsed.data;
  const requestedSlug = slugify(name);

  // Déjà existante (recherche insensible à la casse) : on la renvoie
  // directement plutôt que de demander à l'IA d'en recréer une en double.
  const existing = await prisma.breed.findFirst({
    where: { OR: [{ slug: requestedSlug }, { name: { equals: name, mode: "insensitive" } }] },
    select: { id: true, slug: true, name: true },
  });
  if (existing) {
    return NextResponse.json({ ok: true, breed: existing, created: false });
  }

  let profile;
  try {
    profile = await generateBreedProfile(name);
  } catch (error) {
    if (error instanceof BreedGenerationUnavailableError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    console.error("Erreur lors de la génération de la race par l'IA:", error);
    return NextResponse.json(
      { ok: false, error: "L'IA n'a pas pu générer cette race, réessaie." },
      { status: 502 }
    );
  }

  const slug = await uniqueSlug(slugify(profile.displayName) || requestedSlug);

  const breed = await prisma.breed.create({
    data: {
      slug,
      name: profile.displayName,
      description: profile.description,
      temperament: profile.temperament,
      weightMinKg: profile.weightMinKg,
      weightMaxKg: profile.weightMaxKg,
      imageUrl: `/breed-image/${slug}`,
      aiGenerated: true,
      aiTrainingGuide: profile.trainingGuide,
    },
    select: { id: true, slug: true, name: true },
  });

  return NextResponse.json({ ok: true, breed, created: true });
}
