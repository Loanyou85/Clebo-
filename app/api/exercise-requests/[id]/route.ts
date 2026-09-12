import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  status: z.enum(["VALIDEE", "REFUSEE"]),
  adminNote: z.string().trim().max(500).optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ ok: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const existing = await prisma.exerciseRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Demande introuvable." }, { status: 404 });
  }

  await prisma.exerciseRequest.update({
    where: { id },
    data: {
      status: parsed.data.status,
      adminNote: parsed.data.adminNote ?? null,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
