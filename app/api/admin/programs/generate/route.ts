import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PROGRAMS } from "@/prisma/data/programs";
import { generateProgramDays, ProgramGenerationUnavailableError } from "@/lib/programGeneration";
import { findYoutubeVideo, isYoutubeSearchConfigured } from "@/lib/youtubeSearch";

/**
 * Génère UN lot de séances manquantes pour un programme, depuis l'espace
 * d'administration. Volontairement par lots de 10 plutôt qu'en une fois :
 * générer 30 séances dépasserait la durée maximale d'une fonction
 * serverless. L'administrateur clique jusqu'à ce que le programme soit
 * complet, et voit la progression à chaque clic.
 */
const TAILLE_LOT = 10;

const bodySchema = z.object({ programSlug: z.string().trim().min(1).max(80) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ ok: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Programme invalide." }, { status: 400 });
  }

  const seed = PROGRAMS.find((p) => p.slug === parsed.data.programSlug);
  const programme = await prisma.program.findUnique({ where: { slug: parsed.data.programSlug } });
  if (!seed || !programme) {
    return NextResponse.json({ ok: false, error: "Programme introuvable." }, { status: 404 });
  }

  const existants = await prisma.programDay.findMany({
    where: { programId: programme.id },
    select: { dayNumber: true },
  });
  const dejaFaits = new Set(existants.map((jour) => jour.dayNumber));

  const manquants: number[] = [];
  for (let jour = 1; jour <= programme.durationDays && manquants.length < TAILLE_LOT; jour++) {
    if (!dejaFaits.has(jour)) manquants.push(jour);
  }

  if (manquants.length === 0) {
    await prisma.program.update({ where: { id: programme.id }, data: { published: true } });
    return NextResponse.json({
      ok: true,
      termine: true,
      total: existants.length,
      attendu: programme.durationDays,
    });
  }

  try {
    const jours = await generateProgramDays(
      {
        title: programme.title,
        promise: programme.promise,
        summary: programme.summary,
        durationDays: programme.durationDays,
        exercises: seed.exercises,
      },
      manquants[0],
      manquants[manquants.length - 1]
    );

    // Une seule recherche vidéo par exercice, réutilisée sur tous les jours
    // qui travaillent le même exercice (quota YouTube).
    const indexUtilises = [...new Set(jours.map((jour) => jour.exerciseIndex))];
    const videos = new Map<number, string | null>();
    if (isYoutubeSearchConfigured()) {
      for (const index of indexUtilises) {
        const exercice = seed.exercises[index];
        if (!exercice) continue;
        const trouvee = await findYoutubeVideo(`${exercice} chien dressage`);
        videos.set(index, trouvee?.embedUrl ?? null);
      }
    }

    for (const jour of jours) {
      if (jour.dayNumber < 1 || jour.dayNumber > programme.durationDays) continue;
      await prisma.programDay.upsert({
        where: { programId_dayNumber: { programId: programme.id, dayNumber: jour.dayNumber } },
        update: {
          objective: jour.objective,
          instructions: jour.instructions,
          repetitions: jour.repetitions,
          durationMin: jour.durationMin,
          commonMistake: jour.commonMistake,
          videoUrl: videos.get(jour.exerciseIndex) ?? null,
          aiGenerated: true,
        },
        create: {
          programId: programme.id,
          dayNumber: jour.dayNumber,
          objective: jour.objective,
          instructions: jour.instructions,
          repetitions: jour.repetitions,
          durationMin: jour.durationMin,
          commonMistake: jour.commonMistake,
          videoUrl: videos.get(jour.exerciseIndex) ?? null,
          aiGenerated: true,
        },
      });
    }

    const total = await prisma.programDay.count({ where: { programId: programme.id } });
    const termine = total >= programme.durationDays;
    await prisma.program.update({ where: { id: programme.id }, data: { published: termine } });

    return NextResponse.json({ ok: true, termine, total, attendu: programme.durationDays });
  } catch (error) {
    if (error instanceof ProgramGenerationUnavailableError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    console.error("Erreur de génération du programme:", error);
    return NextResponse.json(
      { ok: false, error: "L'IA n'a pas pu générer ces séances, réessaie." },
      { status: 502 }
    );
  }
}
