import Stripe from "stripe";

// Client Stripe (clé secrète, serveur uniquement) + helpers Checkout.
// Deux flux distincts :
//   - achat unique d'un programme (59 €, accès à vie) : mode "payment",
//     montant envoyé par le code, donc aucun prix à créer dans le
//     tableau de bord Stripe ;
//   - abonnement optionnel "Suivi Clebo" : mode "subscription", price
//     configuré via STRIPE_PRICE_ID.
function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY n'est pas configurée.");
  }
  return new Stripe(secretKey);
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  existingCustomerId: string | null
): Promise<string> {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID n'est pas configurée.");
  }

  const stripe = getStripeClient();
  const siteUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingCustomerId ?? undefined,
    customer_email: existingCustomerId ? undefined : email,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { userId } },
    success_url: `${siteUrl}/app?abonnement=succes`,
    cancel_url: `${siteUrl}/tarifs`,
  });

  if (!session.url) {
    throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
  }
  return session.url;
}

export interface ProgramCheckoutInput {
  userId: string;
  email: string;
  existingCustomerId: string | null;
  programId: string;
  programSlug: string;
  programTitle: string;
  priceCents: number;
}

/**
 * Achat unique d'un programme. Le montant est envoyé directement en
 * `price_data` : il n'y a donc aucun produit ni prix à créer à la main
 * dans Stripe, et changer le prix d'un programme se fait en base.
 */
export async function createProgramCheckoutSession(input: ProgramCheckoutInput): Promise<string> {
  const stripe = getStripeClient();
  const siteUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: input.existingCustomerId ?? undefined,
    customer_email: input.existingCustomerId ? undefined : input.email,
    client_reference_id: input.userId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: input.priceCents,
          product_data: {
            name: input.programTitle,
            description: "Programme de dressage 30 jours — accès à vie",
          },
        },
      },
    ],
    // Repris par le webhook pour créer l'accès : la session est la seule
    // source de vérité, jamais un paramètre d'URL de retour.
    metadata: { userId: input.userId, programId: input.programId },
    payment_intent_data: { metadata: { userId: input.userId, programId: input.programId } },
    success_url: `${siteUrl}/app/programme/${input.programSlug}?achat=succes`,
    cancel_url: `${siteUrl}/programmes/${input.programSlug}`,
  });

  if (!session.url) {
    throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
  }
  return session.url;
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const stripe = getStripeClient();
  const siteUrl = getSiteUrl();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/app`,
  });
  return portalSession.url;
}

export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET n'est pas configurée.");
  }
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}
