import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Toutes les races — Clebo" };

export default async function RacesPage() {
  const breeds = await prisma.breed.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-extrabold mb-2">Toutes les races</h1>
      <p className="text-foreground-muted mb-8 max-w-2xl">
        Chaque race a ses propres besoins d&apos;exercice et son propre gabarit. Choisis la race de ton
        chien pour voir l&apos;alimentation et les techniques de dressage recommandées — ou consulte la
        fiche &quot;Chien croisé&quot; si sa race n&apos;est pas connue.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {breeds.map((breed) => (
          <Link key={breed.id} href={`/races/${breed.slug}`} className="card-surface overflow-hidden hover:border-orange transition-colors">
            <Image src={breed.imageUrl} alt={breed.name} width={400} height={240} className="w-full h-40 object-cover" />
            <div className="p-4">
              <p className="font-display font-bold">{breed.name}</p>
              <p className="text-xs text-foreground-muted">
                {breed.weightMinKg}–{breed.weightMaxKg} kg adulte
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
