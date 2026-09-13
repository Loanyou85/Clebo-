import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dogSchema } from "@/lib/dogSchema";
import { analyzeMixedBreedDog, mixedBreedAnalysisKey } from "@/lib/mixedBreedAnalysis";

async function loadOwnedDog(userId: string, dogId: string) {
  const dog = await prisma.dog.findUnique({ where: { id: dogId } });
  if (!dog || dog.userId !== userId) return null;
  return dog;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await loadOwnedDog(user.id, id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Chien introuvable." }, { status: 404 });
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
  const mixedBreedNote = data.isMixed ? data.mixedBreedNote?.trim() || null : null;
  const characteristics = data.isMixed ? data.characteristics?.trim() || null : null;
  const analysisKey = mixedBreedNote ? mixedBreedAnalysisKey(mixedBreedNote, characteristics) : null;

  await prisma.dog.update({
    where: { id },
    data: {
      name: data.name,
      breedId: data.isMixed ? null : data.breedId,
      isMixed: data.isMixed,
      mixedBreedNote,
      characteristics,
      size: data.size,
      weightKg: data.weightKg,
      ageMonths: data.ageMonths,
      environment: data.environment,
      // Race déclarée directement, ou note inchangée depuis la dernière
      // analyse : l'analyse IA précédente ne s'applique plus / reste valable.
      ...(!mixedBreedNote
        ? { aiMatchedBreedSlugs: [], aiTrainingSummary: null, aiAnalyzedNote: null }
        : {}),
    },
  });

  if (mixedBreedNote && analysisKey !== existing.aiAnalyzedNote) {
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
        where: { id },
        data: {
          aiMatchedBreedSlugs: analysis.matchedBreedSlugs,
          aiTrainingSummary: analysis.trainingSummary,
          aiAnalyzedNote: analysisKey,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await loadOwnedDog(user.id, id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Chien introuvable." }, { status: 404 });
  }

  await prisma.dog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
