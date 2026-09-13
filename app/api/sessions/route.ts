import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasProgramAccess, isDayUnlocked } from "@/lib/programAccess";

const bodySchema = z.object({
  programSlug: z.string().trim().min(1).max(80),
  dogId: z.string().trim().min(1),
  dayNumber: z.number().int().min(1).max(365),
  successes: z.number().int().min(0).max(10),
  note: z.string().trim().max(500).optional().nullable(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }
  const { programSlug, dogId, dayNumber, successes, note } = parsed.data;

  const [programme, dog] = await Promise.all([
    prisma.program.findUnique({ where: { slug: programSlug }, select: { id: true } }),
    prisma.dog.findUnique({ where: { id: dogId }, select: { id: true, userId: true } }),
  ]);
  if (!programme) {
    return NextResponse.json({ ok: false, error: "Programme introuvable." }, { status: 404 });
  }
  if (!dog || dog.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "Chien introuvable." }, { status: 404 });
  }

  // Un jour verrouillé (au-delà du palier gratuit sans achat) ne peut pas
  // être validé : le contrôle est refait ici, pas seulement à l'affichage.
  const acces = await hasProgramAccess(user, programme.id);
  if (!isDayUnlocked(dayNumber, acces)) {
    return NextResponse.json({ ok: false, error: "Ce jour n'est pas débloqué." }, { status: 403 });
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { dogId_programId: { dogId, programId: programme.id } },
    update: {},
    create: { userId: user.id, dogId, programId: programme.id },
  });

  // Refaire une séance déjà validée met à jour son score plutôt que d'en
  // créer une deuxième : la courbe garde un point par jour.
  await prisma.sessionLog.upsert({
    where: { enrollmentId_dayNumber: { enrollmentId: enrollment.id, dayNumber } },
    update: { successes, note: note ?? null, doneAt: new Date() },
    create: { enrollmentId: enrollment.id, dayNumber, successes, note: note ?? null },
  });

  return NextResponse.json({ ok: true });
}
