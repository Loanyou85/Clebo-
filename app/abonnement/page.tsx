import { getCurrentUser, isActiveSubscription } from "@/lib/auth";
import SubscribeButton from "@/components/SubscribeButton";
import BillingPortalButton from "@/components/BillingPortalButton";

const INCLUDED = [
  "Profils illimités pour tes chiens",
  "Toutes les techniques de dressage détaillées, race par race",
  "Vidéos et instructions pas à pas pour chaque exercice",
  "Calculateur d'alimentation et d'eau personnalisé",
  "Marques de nourriture conseillées pour chaque race",
  "Demandes d'exercices sur-mesure pour ton chien",
];

export default async function AbonnementPage() {
  const user = await getCurrentUser();
  const subscribed = user ? isActiveSubscription(user) : false;

  return (
    <div className="container-page py-16 max-w-lg">
      <h1 className="font-display text-3xl font-extrabold mb-2 text-center">Une seule offre, tout inclus</h1>
      <p className="text-foreground-muted text-center mb-10">
        Pas d&apos;essai gratuit, pas de palier : un abonnement simple pour dresser ton chien sereinement.
      </p>

      <div className="card-surface p-8 text-center">
        <p className="font-display text-5xl font-extrabold text-orange-dark">
          27,99€<span className="text-lg font-semibold text-foreground-muted">/mois</span>
        </p>
        <ul className="text-left mt-6 mb-8 space-y-2 text-sm">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-orange">✓</span> {item}
            </li>
          ))}
        </ul>

        {subscribed ? (
          <div className="space-y-3">
            <p className="badge">Abonnement actif</p>
            <BillingPortalButton />
          </div>
        ) : (
          <SubscribeButton loggedIn={!!user} />
        )}
      </div>
    </div>
  );
}
