import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Les programmes de dressage",
  description:
    "Cinq programmes de 30 jours, un problème chacun : marche en laisse, rappel, solitude, propreté, sauts. 59 € une fois, accès à vie.",
};

export default async function ProgrammesPage() {
  const programmes = await prisma.program.findMany({
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      promise: true,
      summary: true,
      durationDays: true,
      priceCents: true,
      published: true,
      _count: { select: { days: true } },
    },
  });

  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-4">Un problème, un programme, 30 jours</h1>
      <p className="prose-clebo text-sourdine mb-10">
        Chaque programme traite un seul problème, jour par jour. Tu paies une fois et tu gardes
        l&apos;accès à vie, sans abonnement. Les trois premiers jours sont gratuits pour que tu voies
        exactement ce que tu achètes.
      </p>

      <div className="flex flex-col gap-4">
        {programmes.map((programme) => (
          <Link
            key={programme.slug}
            href={`/programmes/${programme.slug}`}
            className="card-surface p-6 hover:border-texte transition-colors"
          >
            <p className="font-semibold text-lg mb-2">{programme.title}</p>
            <p className="text-sm text-sourdine mb-4 prose-clebo">{programme.summary}</p>
            <p className="text-sm font-semibold">
              {programme.durationDays} jours ·{" "}
              {(programme.priceCents / 100).toFixed(2).replace(".", ",")} € une fois
              {!programme.published && " · bientôt disponible"}
            </p>
          </Link>
        ))}
      </div>

      <p className="text-sm text-sourdine mt-10 prose-clebo">
        Ton chien grogne, pince ou mord ? Ces situations ne se traitent pas à distance :{" "}
        <Link href="/diagnostic/securite" className="text-signal-texte font-semibold">
          voici ce qu&apos;il faut faire
        </Link>
        .
      </p>
    </div>
  );
}
