import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  if (dogId) {
    const dog = await prisma.dog.findUnique({ where: { id: dogId } });
    if (!dog || dog.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "Chien introuvable." }, { status: 400 });
    }
  }

  await prisma.exerciseRequest.create({
    data: { userId: user.id, dogId: dogId || null, title, description },
  });

  return NextResponse.json({ ok: true });
}
