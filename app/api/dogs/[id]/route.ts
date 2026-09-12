import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dogSchema } from "@/lib/dogSchema";

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

  await prisma.dog.update({
    where: { id },
    data: {
      name: data.name,
      breedId: data.isMixed ? null : data.breedId,
      isMixed: data.isMixed,
      mixedBreedNote: data.isMixed ? data.mixedBreedNote ?? null : null,
      size: data.size,
      weightKg: data.weightKg,
      ageMonths: data.ageMonths,
      environment: data.environment,
    },
  });

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
