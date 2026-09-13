import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProgramCheckoutSession } from "@/lib/stripe";
import { hasProgramAccess } from "@/lib/programAccess";

const bodySchema = z.object({
  programSlug: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Programme invalide." }, { status: 400 });
  }

  const program = await prisma.program.findUnique({ where: { slug: parsed.data.programSlug } });
  if (!program || !program.published) {
    return NextResponse.json({ ok: false, error: "Programme introuvable." }, { status: 404 });
  }

  // Ne jamais faire payer deux fois le même programme : l'accès est à vie.
  if (await hasProgramAccess(user, program.id)) {
    return NextResponse.json({ ok: true, alreadyOwned: true, url: `/app/programme/${program.slug}` });
  }

  try {
    const url = await createProgramCheckoutSession({
      userId: user.id,
      email: user.email,
      existingCustomerId: user.stripeCustomerId,
      programId: program.id,
      programSlug: program.slug,
      programTitle: program.title,
      priceCents: program.priceCents,
    });
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("Erreur lors de la création du paiement Stripe:", error);
    return NextResponse.json(
      { ok: false, error: "Le paiement est indisponible pour le moment, réessaie." },
      { status: 502 }
    );
  }
}
