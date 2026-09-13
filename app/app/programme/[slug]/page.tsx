import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasProgramAccess, isDayUnlocked, FREE_DAYS } from "@/lib/programAccess";
import SessionCheck from "@/components/SessionCheck";
import ProgressLine from "@/components/ProgressLine";
import ProgressChart from "@/components/ProgressChart";

export const metadata: Metadata = { robots: { index: false } };

export default async function ProgrammeSuiviPage({ params }: PageProps<"/app/programme/[slug]">) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=/app/programme/${slug}`);

  const programme = await prisma.program.findUnique({
    where: { slug },
    include: { days: { orderBy: { dayNumber: "asc" } } },
  });
  if (!programme) notFound();

  const acces = await hasProgramAccess(user, programme.id);

  const dogs = await prisma.dog.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  if (dogs.length === 0) {
    return (
      <div className="container-page py-16 max-w-2xl">
        <h1 className="titre text-titre-m mb-4">{programme.title}</h1>
        <div className="card-surface p-6">
          <p className="font-semibold mb-2">Enregistre d&apos;abord ton chien</p>
          <p className="text-sm text-encre-doux mb-5 prose-clebo">
            Les séances s&apos;adaptent à sa race, son âge et son environnement, et c&apos;est son
            nom qui apparaîtra dans ton journal.
          </p>
          <Link href="/chiens/nouveau" className="btn-primary">
            Ajouter mon chien
          </Link>
        </div>
      </div>
    );
  }

  const dog = dogs[0];
  const enrollment = await prisma.enrollment.findUnique({
    where: { dogId_programId: { dogId: dog.id, programId: programme.id } },
    include: { sessions: { orderBy: { dayNumber: "asc" } } },
  });
  const sessions = enrollment?.sessions ?? [];
  const scoreParJour = new Map(sessions.map((s) => [s.dayNumber, s.successes]));

  // Le jour courant est la première séance non faite : on ne saute pas de
  // jour, même si on a pris de l'avance sur le calendrier.
  const jourCourant = Math.min(
    programme.days.length || programme.durationDays,
    sessions.length + 1
  );
  const progression = programme.days.length ? sessions.length / programme.days.length : 0;

  return (
    <div className="container-page py-12 max-w-2xl">
      <p className="text-sm text-encre-doux mb-1">{dog.name}</p>
      <h1 className="titre text-titre-m mb-6">{programme.title}</h1>

      <ProgressLine progress={progression} className="mb-3" />
      <p className="text-sm text-encre-doux mb-10">
        {sessions.length} séance{sessions.length > 1 ? "s" : ""} sur {programme.days.length || programme.durationDays}
      </p>

      {!acces && (
        <div className="card-surface p-6 mb-10">
          <p className="font-semibold mb-2">Les {FREE_DAYS} premiers jours sont ouverts</p>
          <p className="text-sm text-encre-doux mb-5 prose-clebo">
            Débloque les {Math.max(0, programme.days.length - FREE_DAYS)} séances suivantes en une
            fois. Paiement unique, accès à vie, remboursé sous 30 jours si ça ne te convient pas.
          </p>
          <Link href={`/programmes/${programme.slug}`} className="btn-primary">
            Débloquer le programme — {(programme.priceCents / 100).toFixed(2).replace(".", ",")} €
          </Link>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="card-surface p-6 mb-10">
          <p className="font-semibold mb-4">La progression de {dog.name}</p>
          <ProgressChart points={sessions} />
        </div>
      )}

      {programme.days.length === 0 ? (
        <div className="card-surface p-6">
          <p className="text-sm text-encre-doux">
            Les séances de ce programme sont en cours de préparation.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {programme.days.map((jour) => {
            const deverrouille = isDayUnlocked(jour.dayNumber, acces);
            const cest_aujourdhui = jour.dayNumber === jourCourant;
            const score = scoreParJour.get(jour.dayNumber) ?? null;
            const futur = jour.dayNumber > jourCourant;

            if (!deverrouille) {
              return (
                <div key={jour.id} className="card-surface p-5 opacity-60">
                  <p className="text-sm text-encre-doux">Jour {jour.dayNumber} — verrouillé</p>
                </div>
              );
            }

            if (futur) {
              return (
                <div key={jour.id} className="card-surface p-5 opacity-60">
                  <p className="text-sm text-encre-doux">
                    Jour {jour.dayNumber} — après le jour {jourCourant}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={jour.id}
                className={`card-surface p-6 ${cest_aujourdhui ? "border-signal" : ""}`}
              >
                <p className="text-sm text-encre-doux mb-1">
                  Jour {jour.dayNumber}
                  {cest_aujourdhui ? " — ta séance du jour" : ""}
                </p>
                <p className="font-semibold text-lg mb-4">{jour.objective}</p>

                {jour.videoUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-[4px] mb-4">
                    <iframe
                      src={jour.videoUrl}
                      className="w-full h-full"
                      title={`Démonstration — jour ${jour.dayNumber}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <p className="prose-clebo text-encre-doux whitespace-pre-line mb-4">{jour.instructions}</p>

                <p className="text-sm text-encre-doux mb-4">
                  {jour.durationMin} min · {jour.repetitions} répétitions
                </p>

                <div className="border-t border-brume pt-4 mb-5">
                  <p className="text-sm font-semibold mb-1">L&apos;erreur à ne pas commettre</p>
                  <p className="text-sm text-encre-doux">{jour.commonMistake}</p>
                </div>

                <SessionCheck
                  programSlug={programme.slug}
                  dogId={dog.id}
                  dayNumber={jour.dayNumber}
                  scoreExistant={score}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
