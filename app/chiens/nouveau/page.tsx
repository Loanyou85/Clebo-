import { prisma } from "@/lib/prisma";
import DogForm from "@/components/DogForm";

export default async function NouveauChienPage() {
  const breeds = await prisma.breed.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="container-page py-12 max-w-xl">
      <h1 className="font-display text-3xl font-extrabold mb-2">Ajouter un chien</h1>
      <p className="text-foreground-muted mb-8">
        Ces informations permettent d&apos;adapter le dressage et l&apos;alimentation conseillés.
      </p>
      <div className="card-surface p-6">
        <DogForm breeds={breeds} />
      </div>
    </div>
  );
}
