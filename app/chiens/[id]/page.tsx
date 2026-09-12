import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeFeedingPlan } from "@/lib/feeding";
import { SIZE_LABELS, ENVIRONMENT_LABELS } from "@/lib/dogSchema";
import DogForm from "@/components/DogForm";
import DeleteDogButton from "@/components/DeleteDogButton";

export default async function ChienPage({ params }: PageProps<"/chiens/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const dog = await prisma.dog.findUnique({ where: { id }, include: { breed: true } });
  if (!dog || dog.userId !== user.id) notFound();

  const breeds = await prisma.breed.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const feedingPlan = computeFeedingPlan(dog);

  const exercises = dog.breedId
    ? await prisma.exercise.findMany({
        where: { OR: [{ forAllBreeds: true }, { breeds: { some: { breedId: dog.breedId } } }] },
        orderBy: { title: "asc" },
      })
    : await prisma.exercise.findMany({ where: { forAllBreeds: true }, orderBy: { title: "asc" } });

  return (
    <div className="container-page py-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-3xl font-extrabold">{dog.name}</h1>
          <DeleteDogButton dogId={dog.id} />
        </div>
        <p className="text-foreground-muted mb-6">
          {dog.breed ? dog.breed.name : dog.mixedBreedNote || "Chien croisé"} · {SIZE_LABELS[dog.size]} ·{" "}
          {ENVIRONMENT_LABELS[dog.environment]}
        </p>

        <div className="card-surface p-6 mb-6">
          <DogForm
            dogId={dog.id}
            breeds={breeds}
            initial={{
              name: dog.name,
              isMixed: dog.isMixed,
              breedId: dog.breedId,
              mixedBreedNote: dog.mixedBreedNote,
              size: dog.size,
              weightKg: dog.weightKg,
              ageMonths: dog.ageMonths,
              environment: dog.environment,
            }}
          />
        </div>

        <div className="card-surface p-6">
          <h2 className="font-display font-bold text-lg mb-3">Plan alimentation quotidien</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground-muted">Croquettes / jour</p>
              <p className="font-bold text-xl text-orange-dark">{feedingPlan.dailyFoodGrams} g</p>
            </div>
            <div>
              <p className="text-foreground-muted">Eau / jour</p>
              <p className="font-bold text-xl text-orange-dark">{feedingPlan.dailyWaterLiters} L</p>
            </div>
            <div>
              <p className="text-foreground-muted">Repas / jour</p>
              <p className="font-bold text-xl text-orange-dark">{feedingPlan.mealsPerDay}</p>
            </div>
            <div>
              <p className="text-foreground-muted">Besoin énergétique</p>
              <p className="font-bold text-xl text-orange-dark">{feedingPlan.dailyKcal} kcal</p>
            </div>
          </div>
          <Link href="/alimentation" className="text-orange-dark font-semibold text-sm mt-4 inline-block">
            Voir les marques conseillées →
          </Link>
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-lg mb-3">
          Exercices de dressage recommandés{dog.breed ? ` pour un ${dog.breed.name}` : ""}
        </h2>
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
                  {ex.repetitions} répétitions · {ex.frequencyPerDay}x/jour · ~{ex.durationWeeks} semaines
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href={`/demandes-exercices?dogId=${dog.id}`}
          className="btn-outline w-full mt-4 justify-center"
        >
          Demander un exercice sur-mesure pour {dog.name}
        </Link>
      </div>
    </div>
  );
}
