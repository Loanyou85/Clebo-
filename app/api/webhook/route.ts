import { NextResponse } from "next/server";
import Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/webhook
// Source de vérité pour le statut d'abonnement en base : ne fait jamais
// confiance au client, uniquement aux évènements Stripe signés.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    console.error("Signature webhook Stripe invalide:", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (userId && session.customer && session.subscription) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: String(session.customer),
              stripeSubscriptionId: String(session.subscription),
              subscriptionStatus: "ACTIVE",
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = mapStripeStatus(subscription.status);
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { subscriptionStatus: status },
        });
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Erreur de traitement du webhook ${event.type}:`, error);
    return NextResponse.json({ error: "Erreur de traitement." }, { status: 500 });
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): "ACTIVE" | "CANCELED" | "PAST_DUE" | "INACTIVE" {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "INACTIVE";
  }
}
