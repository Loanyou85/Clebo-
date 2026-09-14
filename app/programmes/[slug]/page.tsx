import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasProgramAccess, FREE_DAYS } from "@/lib/programAccess";
import ProgramBuyButton from "@/components/ProgramBuyButton";

export async function generateMetadata({ params }: PageProps<"/programmes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const programme = await prisma.program.findUnique({
    where: { slug },
    select: { title: true, promise: true, summary: true },
  });
  if (!programme) return {};
  return {
    title: programme.title,
    description: programme.summary,
    openGraph: { title: `${programme.promise} — Clebo`, description: programme.summary },
  };
}

export default async function ProgrammePage({ params }: PageProps<"/programmes/[slug]">) {
  const { slug } = await params;
  const programme = await prisma.program.findUnique({
    where: { slug },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        select: {
          dayNumber: true,
          objective: true,
          durationMin: true,
          repetitions: true,
          commonMistake: true,
        },
      },
    },
  });
  if (!programme) notFound();

  const user = await getCurrentUser();
  const acces = await hasProgramAccess(user, programme.id);
  const gratuites = programme.days.filter((jour) => jour.dayNumber <= FREE_DAYS);
  const restantes = Math.max(0, programme.days.length - gratuites.length);

  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-4">{programme.promise}</h1>
      <p className="prose-clebo text-sourdine mb-8">{programme.summary}</p>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-10">
        <span>
          <strong>{programme.durationDays} jours</strong>
        </span>
        <span>
          <strong>5 à 15 minutes</strong> par jour
        </span>
        <span>
          <strong>Accès à vie</strong>, sans abonnement
        </span>
      </div>

      {acces ? (
        <div className="card-surface p-6 mb-12">
          <p className="font-semibold mb-3">Tu as déjà ce programme.</p>
          <Link href={`/app/programme/${programme.slug}`} className="btn-primary">
            Reprendre où j&apos;en suis
          </Link>
        </div>
      ) : (
        <div className="mb-12">
          <ProgramBuyButton
            programSlug={programme.slug}
            priceCents={programme.priceCents}
            loggedIn={Boolean(user)}
          />
        </div>
      )}

      <h2 className="titre text-titre-s mb-2">Les {FREE_DAYS} premiers jours, gratuitement</h2>
      <p className="text-sm text-sourdine mb-6">
        Tu peux les faire avec ton chien avant même de payer.
      </p>

      {gratuites.length > 0 ? (
        <div className="flex flex-col gap-3 mb-10">
          {gratuites.map((jour) => (
            <div key={jour.dayNumber} className="card-surface p-5">
              <p className="text-sm text-sourdine mb-1">Jour {jour.dayNumber}</p>
              <p className="font-semibold mb-3">{jour.objective}</p>
              <p className="text-sm text-sourdine mb-3">
                {jour.durationMin} min · {jour.repetitions} répétitions
              </p>
              <p className="text-sm text-sourdine">
                <span className="font-semibold text-texte">L&apos;erreur classique : </span>
                {jour.commonMistake}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface p-5 mb-10">
          <p className="text-sm text-sourdine">
            Les séances de ce programme sont en cours de préparation. Reviens très bientôt.
          </p>
        </div>
      )}

      {restantes > 0 && (
        <p className="text-sm text-sourdine mb-10">
          Puis {restantes} séances jusqu&apos;au jour {programme.durationDays}, débloquées d&apos;un
          coup après l&apos;achat.
        </p>
      )}

      <h2 className="titre text-titre-s mb-3">Et si ça ne marche pas ?</h2>
      <p className="prose-clebo text-sourdine">
        Tu es remboursé sur simple demande pendant 30 jours, sans avoir à te justifier. La plupart
        des chiens progressent nettement en trois semaines, mais aucun professionnel sérieux ne peut
        garantir le comportement d&apos;un animal — nous non plus.
      </p>
    </div>
  );
}
