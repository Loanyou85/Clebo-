import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isActiveSubscription } from "@/lib/auth";

export default async function RaceDetailPage({ params }: PageProps<"/races/[slug]">) {
  const { slug } = await params;
  const breed = await prisma.breed.findUnique({ where: { slug } });
  if (!breed) notFound();

  const user = await getCurrentUser();
  const subscribed = user ? isActiveSubscription(user) : false;

  const [exercises, foodBrands] = await Promise.all([
    prisma.exercise.findMany({
      where: { OR: [{ forAllBreeds: true }, { breeds: { some: { breedId: breed.id } } }] },
      orderBy: { title: "asc" },
    }),
    prisma.foodBrand.findMany({
      where: { OR: [{ forAllBreeds: true }, { breeds: { some: { breedId: breed.id } } }] },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container-page py-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <Image src={breed.imageUrl} alt={breed.name} width={600} height={400} className="w-full rounded-2xl object-cover mb-5" />
        <h1 className="font-display text-3xl font-extrabold mb-2">{breed.name}</h1>
        <p className="badge mb-4">
          {breed.weightMinKg}–{breed.weightMaxKg} kg adulte
        </p>
        <p className="text-foreground-muted mb-4">{breed.description}</p>
        <h2 className="font-display font-bold mb-1">Tempérament</h2>
        <p className="text-foreground-muted mb-6">{breed.temperament}</p>

        <Link href="/chiens/nouveau" className="btn-primary">
          Enregistrer un {breed.name}
        </Link>
      </div>

      <div className="space-y-8">
        {breed.aiGenerated && breed.aiTrainingGuide && (
          <section>
            <h2 className="font-display text-xl font-bold mb-3">Guide de dressage complet (généré par l&apos;IA)</h2>
            {subscribed ? (
              <div className="card-surface p-5">
                <p className="text-foreground-muted whitespace-pre-line">{breed.aiTrainingGuide}</p>
              </div>
            ) : (
              <div className="card-surface p-6 text-center">
                <p className="font-semibold mb-2">Le guide de dressage détaillé pour cette race est réservé aux abonnés.</p>
                <p className="text-foreground-muted text-sm mb-4">
                  Abonne-toi pour débloquer ce guide complet et toutes les techniques de dressage détaillées.
                </p>
                <Link href={user ? "/tarifs" : "/inscription"} className="btn-primary">
                  {user ? "S'abonner au Suivi Clebo — 14,99 €/mois" : "Créer un compte pour continuer"}
                </Link>
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Techniques de dressage recommandées</h2>
          <div className="space-y-3">
            {exercises.map((ex) => (
              <Link
                key={ex.id}
                href={`/exercices/${ex.id}`}
                className="card-surface p-4 flex gap-3 items-center hover:border-orange transition-colors"
              >
                {ex.imageUrl && (
                  <Image src={ex.imageUrl} alt="" width={56} height={56} className="rounded-lg object-cover shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{ex.title}</p>
                  <p className="text-xs text-foreground-muted">
                    {ex.repetitions} répétitions · {ex.frequencyPerDay}x/jour · ~{ex.durationWeeks} semaines pour être acquis
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Marques de nourriture conseillées</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {foodBrands.map((brand) => (
              <div key={brand.id} className="card-surface p-4">
                <p className="font-semibold">{brand.name}</p>
                <p className="text-xs text-foreground-muted">{brand.description}</p>
              </div>
            ))}
          </div>
          <Link href="/rations" className="text-orange-dark font-semibold text-sm mt-3 inline-block">
            Calculer les quantités pour ton chien →
          </Link>
        </section>
      </div>
    </div>
  );
}
