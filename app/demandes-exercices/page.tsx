import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { youtubeSearchUrl } from "@/lib/youtubeSearch";
import ExerciseRequestForm from "@/components/ExerciseRequestForm";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente de validation",
  VALIDEE: "Validée",
  REFUSEE: "Refusée",
};

export default async function DemandesExercicesPage({
  searchParams,
}: PageProps<"/demandes-exercices">) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const { dogId } = await searchParams;
  const subscribed = isActiveSubscription(user);

  const [dogs, requests] = await Promise.all([
    prisma.dog.findMany({ where: { userId: user.id }, select: { id: true, name: true } }),
    prisma.exerciseRequest.findMany({
      where: { userId: user.id },
      include: { dog: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold mb-2">Demandes d&apos;exercices sur-mesure</h1>
      <p className="text-foreground-muted mb-8">
        Un exercice que tu veux faire faire à ton chien n&apos;est pas dans notre bibliothèque de base ?
        Décris-le : l&apos;IA génère aussitôt son déroulé complet, ce qu&apos;il ne faut pas faire et le
        temps d&apos;acquisition estimé.
      </p>

      {subscribed ? (
        <div className="card-surface p-6 mb-10">
          <ExerciseRequestForm dogs={dogs} defaultDogId={Array.isArray(dogId) ? dogId[0] : dogId} />
        </div>
      ) : (
        <div className="card-surface p-6 mb-10 text-center">
          <p className="font-semibold mb-2">Module réservé aux abonnés.</p>
          <Link href="/abonnement" className="btn-primary">
            S&apos;abonner — 27,99€/mois
          </Link>
        </div>
      )}

      <h2 className="font-display font-bold text-lg mb-3">Mes demandes</h2>
      {requests.length === 0 ? (
        <p className="text-foreground-muted text-sm">Aucune demande envoyée pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="card-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{req.title}</p>
                <span className="badge">{STATUS_LABELS[req.status]}</span>
              </div>
              {req.dog && <p className="text-xs text-foreground-muted mt-1">Pour {req.dog.name}</p>}
              <p className="text-sm text-foreground-muted mt-2">{req.description}</p>
              {req.adminNote && (
                <p className="text-sm text-orange-dark mt-2">Note de l&apos;équipe : {req.adminNote}</p>
              )}

              {req.aiDescription && (
                <div className="mt-4 pt-4 border-t border-black/10 space-y-3">
                  <p className="badge">Exercice généré par l&apos;IA</p>

                  <div>
                    <h3 className="font-semibold text-sm mb-1">Comment procéder</h3>
                    <p className="text-sm text-foreground-muted whitespace-pre-line">{req.aiDescription}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-red-700">Ce qu&apos;il ne faut pas faire</h3>
                    <p className="text-sm text-foreground-muted whitespace-pre-line">{req.aiCommonMistakes}</p>
                  </div>

                  <p className="text-sm">
                    <span className="text-foreground-muted">Acquis en environ </span>
                    <span className="font-bold text-orange-dark">~{req.aiDurationWeeks} semaines</span>
                  </p>

                  {req.aiVideoSearchQuery && (
                    <a
                      href={youtubeSearchUrl(req.aiVideoSearchQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-dark font-semibold text-sm inline-block"
                    >
                      Rechercher des vidéos de démonstration sur YouTube →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
