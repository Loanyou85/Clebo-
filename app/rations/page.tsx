import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeFeedingPlan } from "@/lib/feeding";

export default async function AlimentationPage({ searchParams }: PageProps<"/rations">) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const { dogId } = await searchParams;
  const dogs = await prisma.dog.findMany({
    where: { userId: user.id },
    include: { breed: true },
    orderBy: { createdAt: "asc" },
  });

  const selectedDogIdParam = Array.isArray(dogId) ? dogId[0] : dogId;
  const selectedDog = selectedDogIdParam
    ? dogs.find((d) => d.id === selectedDogIdParam)
    : dogs[0];

  const plan = selectedDog ? computeFeedingPlan(selectedDog) : null;
  const foodBrands = selectedDog
    ? await prisma.foodBrand.findMany({
        where: selectedDog.breedId
          ? { OR: [{ forAllBreeds: true }, { breeds: { some: { breedId: selectedDog.breedId } } }] }
          : { forAllBreeds: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-extrabold mb-2">Alimentation</h1>
      <p className="text-foreground-muted mb-8 max-w-2xl">
        La quantité de nourriture et d&apos;eau nécessaire dépend surtout du poids, de l&apos;âge et du
        niveau d&apos;activité de ton chien. Sélectionne un chien enregistré pour un calcul personnalisé.
      </p>

      {dogs.length === 0 ? (
        <div className="card-surface p-8 text-center text-foreground-muted">
          Enregistre d&apos;abord un chien pour obtenir un calcul personnalisé.{" "}
          <Link href="/chiens/nouveau" className="text-orange-dark font-semibold">
            Ajouter un chien
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {dogs.map((dog) => (
              <Link
                key={dog.id}
                href={`/rations?dogId=${dog.id}`}
                className={dog.id === selectedDog?.id ? "btn-primary text-sm py-2 px-4" : "btn-outline text-sm py-2 px-4"}
              >
                {dog.name}
              </Link>
            ))}
          </div>

          {plan && selectedDog && (
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="card-surface p-6">
                <h2 className="font-display font-bold text-lg mb-4">
                  Plan quotidien pour {selectedDog.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-foreground-muted">Croquettes / jour</p>
                    <p className="font-bold text-2xl text-orange-dark">{plan.dailyFoodGrams} g</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted">Eau / jour</p>
                    <p className="font-bold text-2xl text-orange-dark">{plan.dailyWaterLiters} L</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted">Nombre de repas</p>
                    <p className="font-bold text-2xl text-orange-dark">{plan.mealsPerDay}</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted">Besoin énergétique</p>
                    <p className="font-bold text-2xl text-orange-dark">{plan.dailyKcal} kcal</p>
                  </div>
                </div>
                <p className="text-xs text-foreground-muted mt-4">
                  Estimation basée sur le poids ({selectedDog.weightKg} kg), l&apos;âge et l&apos;environnement
                  de vie renseignés. À ajuster avec ton vétérinaire en cas de doute (croissance, gestation,
                  pathologie).
                </p>
              </div>

              <div>
                <h2 className="font-display font-bold text-lg mb-3">
                  Marques conseillées{selectedDog.breed ? ` pour un ${selectedDog.breed.name}` : ""}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {foodBrands.map((brand) => (
                    <div key={brand.id} className="card-surface p-4">
                      <p className="font-semibold">{brand.name}</p>
                      <p className="text-xs text-foreground-muted">{brand.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
