import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estProblemeConnu, programmeRecommande } from "@/lib/diagnostic";
import { contientSujetSensible } from "@/lib/securite";
import { FREE_DAYS } from "@/lib/programAccess";

const bodySchema = z.object({
  probleme: z.string().trim().min(1).max(60),
  race: z.string().trim().max(80).optional(),
  age: z.string().trim().max(10).optional(),
  depuis: z.string().trim().max(60).optional(),
  essaye: z.string().trim().max(120).optional(),
  temps: z.string().trim().max(10).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Réponses invalides." },
      { status: 400 }
    );
  }
  const reponses = parsed.data;

  // Filtre de sécurité appliqué aussi côté serveur : le client peut être
  // contourné, et un cas d'agressivité ne doit jamais recevoir de plan ni
  // de bouton d'achat.
  if (
    reponses.probleme === "SENSIBLE" ||
    contientSujetSensible(reponses.race, reponses.depuis, reponses.essaye)
  ) {
    return NextResponse.json({ ok: true, sensible: true });
  }

  if (!estProblemeConnu(reponses.probleme)) {
    return NextResponse.json({ ok: false, error: "Problème inconnu." }, { status: 400 });
  }

  const slug = programmeRecommande(reponses.probleme);
  const program = slug
    ? await prisma.program.findUnique({
        where: { slug },
        include: {
          days: {
            where: { dayNumber: { lte: FREE_DAYS } },
            orderBy: { dayNumber: "asc" },
            select: { dayNumber: true, objective: true, durationMin: true, repetitions: true },
          },
          _count: { select: { days: true } },
        },
      })
    : null;

  if (!program) {
    return NextResponse.json({ ok: false, error: "Aucun programme disponible." }, { status: 404 });
  }

  const minutesPerDay = reponses.temps ? Number(reponses.temps) : null;
  const ageMonths = reponses.age ? Number(reponses.age) : null;
  const user = await getCurrentUser();

  // Enregistré même sans compte (userId null) : c'est la mesure de ce qui
  // amène les visiteurs, et le plan est rattaché au compte s'il en crée un.
  await prisma.diagnostic.create({
    data: {
      userId: user?.id ?? null,
      probleme: reponses.probleme,
      breedSlug: reponses.race ?? null,
      ageMonths: Number.isFinite(ageMonths) ? ageMonths : null,
      sinceLabel: reponses.depuis ?? null,
      triedLabel: reponses.essaye ?? null,
      minutesPerDay: Number.isFinite(minutesPerDay) ? minutesPerDay : null,
      recommendedProgramId: program.id,
    },
  });

  return NextResponse.json({
    ok: true,
    sensible: false,
    plan: {
      programSlug: program.slug,
      programTitle: program.title,
      promise: program.promise,
      summary: program.summary,
      durationDays: program.durationDays,
      priceCents: program.priceCents,
      premieresSeances: program.days,
      seancesRestantes: Math.max(0, program._count.days - program.days.length),
      minutesPerDay: Number.isFinite(minutesPerDay) ? minutesPerDay : null,
    },
  });
}
