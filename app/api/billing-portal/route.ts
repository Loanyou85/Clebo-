import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ ok: false, error: "Aucun abonnement à gérer." }, { status: 400 });
  }

  try {
    const url = await createBillingPortalSession(user.stripeCustomerId);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("Erreur création Billing Portal Session:", error);
    return NextResponse.json({ ok: false, error: "Impossible d'ouvrir la gestion d'abonnement." }, { status: 502 });
  }
}
