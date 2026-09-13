import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Diagnostic from "@/components/Diagnostic";

export const metadata: Metadata = {
  title: "Diagnostic gratuit en 40 secondes",
  description:
    "6 questions sur ton chien, et tu repars avec un plan de dressage personnalisé : programme recommandé, durée, et les 3 premières séances en clair. Sans compte.",
};

export default async function DiagnosticPage({ searchParams }: PageProps<"/diagnostic">) {
  const { probleme } = await searchParams;
  const races = await prisma.breed.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  const reponseInitiale = Array.isArray(probleme) ? probleme[0] : probleme;

  return (
    <div className="container-page py-12 max-w-2xl">
      <Diagnostic races={races} reponseInitiale={reponseInitiale} />
    </div>
  );
}
