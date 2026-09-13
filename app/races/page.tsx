import { prisma } from "@/lib/prisma";
import RaceSearchSection from "@/components/RaceSearchSection";

export const metadata = { title: "Toutes les races — Clebo" };

export default async function RacesPage() {
  const breeds = await prisma.breed.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, imageUrl: true, weightMinKg: true, weightMaxKg: true },
  });

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-extrabold mb-2">Toutes les races</h1>
      <p className="text-foreground-muted mb-6 max-w-2xl">
        Chaque race a ses propres besoins d&apos;exercice et son propre gabarit. Cherche la race de ton
        chien ci-dessous — si elle n&apos;existe pas encore (race rare ou chien croisé), crée-la et
        l&apos;IA génère aussitôt sa fiche complète et son guide de dressage.
      </p>

      <RaceSearchSection breeds={breeds} />
    </div>
  );
}
