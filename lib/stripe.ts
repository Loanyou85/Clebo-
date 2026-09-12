import Stripe from "stripe";

// Client Stripe (clé secrète, serveur uniquement) + helpers Checkout.
// L'abonnement unique Clebo: 27,99€/mois, un seul price configuré via
// STRIPE_PRICE_ID.
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
    success_url: `${siteUrl}/dashboard?abonnement=succes`,
    cancel_url: `${siteUrl}/abonnement`,
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
    return_url: `${siteUrl}/dashboard`,
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
