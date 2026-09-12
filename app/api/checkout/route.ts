import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });
  }

  try {
    const url = await createCheckoutSession(user.id, user.email, user.stripeCustomerId);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("Erreur création Checkout Session:", error);
    return NextResponse.json(
      { ok: false, error: "Impossible de démarrer le paiement, réessaie." },
      { status: 502 }
    );
  }
}
