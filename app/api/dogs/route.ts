import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dogSchema } from "@/lib/dogSchema";
import { analyzeMixedBreedDog, mixedBreedAnalysisKey } from "@/lib/mixedBreedAnalysis";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = dogSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (!data.isMixed && data.breedId) {
    const breed = await prisma.breed.findUnique({ where: { id: data.breedId } });
    if (!breed) {
      return NextResponse.json({ ok: false, error: "Race inconnue." }, { status: 400 });
    }
  }

  const mixedBreedNote = data.isMixed ? data.mixedBreedNote?.trim() || null : null;
  const characteristics = data.isMixed ? data.characteristics?.trim() || null : null;

  const dog = await prisma.dog.create({
    data: {
      userId: user.id,
      name: data.name,
      breedId: data.isMixed ? null : data.breedId,
      isMixed: data.isMixed,
      mixedBreedNote,
      characteristics,
      size: data.size,
      weightKg: data.weightKg,
      ageMonths: data.ageMonths,
      environment: data.environment,
    },
  });

  if (mixedBreedNote) {
    const analysis = await analyzeMixedBreedDog({
      mixedBreedNote,
      characteristics,
      weightKg: data.weightKg,
      ageMonths: data.ageMonths,
      size: data.size,
      environment: data.environment,
    });
    if (analysis) {
      await prisma.dog.update({
        where: { id: dog.id },
        data: {
          aiMatchedBreedSlugs: analysis.matchedBreedSlugs,
          aiTrainingSummary: analysis.trainingSummary,
          aiAnalyzedNote: mixedBreedAnalysisKey(mixedBreedNote, characteristics),
        },
      });
    }
  }

  return NextResponse.json({ ok: true, dogId: dog.id });
}
