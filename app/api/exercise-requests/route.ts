import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateCustomExercise,
  CustomExerciseGenerationUnavailableError,
} from "@/lib/customExerciseGeneration";
import { findYoutubeVideo } from "@/lib/youtubeSearch";
import { SIZE_LABELS, ENVIRONMENT_LABELS } from "@/lib/dogSchema";

const bodySchema = z.object({
  title: z.string().trim().min(3, "Le titre est trop court.").max(120),
  description: z.string().trim().min(10, "Décris un peu plus précisément l'exercice souhaité.").max(2000),
  dogId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }
  if (!isActiveSubscription(user)) {
    return NextResponse.json(
      { ok: false, error: "Un abonnement actif est nécessaire pour demander un exercice sur-mesure." },
      { status: 403 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }
  const { title, description, dogId } = parsed.data;

  const dog = dogId
    ? await prisma.dog.findUnique({ where: { id: dogId }, include: { breed: true } })
    : null;
  if (dogId && (!dog || dog.userId !== user.id)) {
    return NextResponse.json({ ok: false, error: "Chien introuvable." }, { status: 400 });
  }

  const created = await prisma.exerciseRequest.create({
    data: { userId: user.id, dogId: dogId || null, title, description },
  });

  try {
    const content = await generateCustomExercise({
      title,
      description,
      dogContext:
        dog && dog.breed
          ? {
              breedName: dog.breed.name,
              size: SIZE_LABELS[dog.size],
              ageMonths: dog.ageMonths,
              environment: ENVIRONMENT_LABELS[dog.environment],
            }
          : null,
    });

    const video = await findYoutubeVideo(content.videoSearchQuery);

    const updated = await prisma.exerciseRequest.update({
      where: { id: created.id },
      data: {
        status: "VALIDEE",
        reviewedAt: new Date(),
        aiDescription: content.description,
        aiCommonMistakes: content.commonMistakes,
        aiDurationWeeks: content.durationWeeks,
        aiVideoSearchQuery: content.videoSearchQuery,
        aiVideoUrl: video?.embedUrl ?? null,
      },
    });

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    if (!(error instanceof CustomExerciseGenerationUnavailableError)) {
      console.error("Erreur lors de la génération de l'exercice sur-mesure par l'IA:", error);
    }
    // L'IA n'a pas pu générer le contenu (clé absente ou erreur) : la
    // demande reste enregistrée EN_ATTENTE pour une validation manuelle
    // classique plutôt que d'échouer l'envoi de la demande elle-même.
    return NextResponse.json({ ok: true, status: created.status });
  }
}
