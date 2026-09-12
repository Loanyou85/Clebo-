import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentUser, isActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LEVEL_LABELS: Record<string, string> = {
  PROPRETE: "Propreté",
  RAPPEL: "Rappel",
  LAISSE: "Marche en laisse",
  OBEISSANCE_BASE: "Obéissance de base",
  SOCIALISATION: "Socialisation",
};

export default async function ExerciceDetailPage({ params }: PageProps<"/exercices/[id]">) {
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { breeds: { include: { breed: true } } },
  });
  if (!exercise) notFound();

  const user = await getCurrentUser();
  const subscribed = user ? isActiveSubscription(user) : false;

  return (
    <div className="container-page py-12 max-w-3xl">
      {exercise.imageUrl && (
        <Image src={exercise.imageUrl} alt={exercise.title} width={800} height={400} className="w-full rounded-2xl object-cover mb-6 max-h-72" />
      )}

      <p className="badge mb-2">{LEVEL_LABELS[exercise.level] ?? exercise.level}</p>
      <h1 className="font-display text-3xl font-extrabold mb-4">{exercise.title}</h1>

      <div className="grid grid-cols-3 gap-3 mb-6 text-center">
        <div className="card-surface p-3">
          <p className="text-xs text-foreground-muted">Répétitions</p>
          <p className="font-bold text-lg text-orange-dark">{exercise.repetitions}</p>
        </div>
        <div className="card-surface p-3">
          <p className="text-xs text-foreground-muted">Par jour</p>
          <p className="font-bold text-lg text-orange-dark">{exercise.frequencyPerDay}x</p>
        </div>
        <div className="card-surface p-3">
          <p className="text-xs text-foreground-muted">Acquis en</p>
          <p className="font-bold text-lg text-orange-dark">~{exercise.durationWeeks} sem.</p>
        </div>
      </div>

      {subscribed ? (
        <>
          <div className="card-surface p-6 mb-6">
            <h2 className="font-display font-bold mb-2">Comment procéder</h2>
            <p className="text-foreground-muted whitespace-pre-line">{exercise.description}</p>
          </div>

          {exercise.videoUrl && (
            <div className="card-surface p-6 mb-6">
              <h2 className="font-display font-bold mb-3">Vidéo de démonstration</h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  src={exercise.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card-surface p-6 mb-6 text-center">
          <p className="font-semibold mb-2">Le déroulé détaillé de l&apos;exercice est réservé aux abonnés.</p>
          <p className="text-foreground-muted text-sm mb-4">
            Abonne-toi pour débloquer toutes les techniques de dressage détaillées, les vidéos et le
            module de demande d&apos;exercice sur-mesure.
          </p>
          <Link href={user ? "/abonnement" : "/inscription"} className="btn-primary">
            {user ? "S'abonner — 27,99€/mois" : "Créer un compte pour continuer"}
          </Link>
        </div>
      )}

      {exercise.breeds.length > 0 && (
        <div>
          <h2 className="font-display font-bold mb-2">Particulièrement recommandé pour</h2>
          <div className="flex flex-wrap gap-2">
            {exercise.breeds.map(({ breed }) => (
              <Link key={breed.id} href={`/races/${breed.slug}`} className="badge">
                {breed.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
