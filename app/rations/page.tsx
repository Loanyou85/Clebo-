import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeFeedingPlan } from "@/lib/feeding";
import RationsCalculator from "@/components/RationsCalculator";

export const metadata: Metadata = {
  title: "Calculateur de ration pour chien",
  description:
    "Combien de croquettes et d'eau par jour pour ton chien ? Calcul gratuit à partir de son poids, de son âge et de son lieu de vie.",
  alternates: { canonical: "/rations" },
};

export default async function RationsPage() {
  // Page gratuite et indexable : le calculateur fonctionne sans compte.
  // Les chiens enregistrés ne sont qu'un raccourci pour ceux qui en ont.
  const user = await getCurrentUser();
  const dogs = user
    ? await prisma.dog.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, weightKg: true, ageMonths: true, environment: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-4">Combien de croquettes par jour pour ton chien ?</h1>
      <p className="prose-clebo text-encre-doux mb-10">
        La quantité dépend surtout du poids, de l&apos;âge et du niveau d&apos;activité. Ce calcul
        est gratuit et ne demande pas de compte.
      </p>

      <RationsCalculator />

      {dogs.length > 0 && (
        <section className="mt-12">
          <h2 className="titre text-titre-s mb-4">Tes chiens enregistrés</h2>
          <div className="flex flex-col gap-3">
            {dogs.map((dog) => {
              const plan = computeFeedingPlan(dog);
              return (
                <div key={dog.id} className="card-surface p-5">
                  <p className="font-semibold mb-2">{dog.name}</p>
                  <p className="text-sm text-encre-doux">
                    {plan.dailyFoodGrams} g de croquettes · {plan.dailyWaterLiters} L d&apos;eau ·{" "}
                    {plan.mealsPerDay} repas par jour
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="titre text-titre-s mb-3">Comment ce calcul est fait</h2>
        <p className="prose-clebo text-encre-doux mb-4">
          On part du besoin énergétique au repos, la formule vétérinaire standard : 70 × poids^0,75
          en kilocalories par jour. On applique ensuite un coefficient d&apos;activité selon
          l&apos;âge et le lieu de vie — un chiot dépense bien plus qu&apos;un chien âgé, un chien
          qui vit à la campagne plus qu&apos;un chien en appartement.
        </p>
        <p className="prose-clebo text-encre-doux">
          Pour l&apos;eau, on compte environ 60 ml par kilo et par jour. Augmente en cas de chaleur,
          d&apos;effort ou d&apos;alimentation sèche exclusive.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="titre text-titre-s mb-3">Ton chien a un problème de comportement ?</h2>
        <p className="prose-clebo text-encre-doux mb-5">
          Laisse, rappel, propreté, solitude, sauts : le diagnostic te dit en 40 secondes par où
          commencer, gratuitement.
        </p>
        <Link href="/diagnostic" className="btn-primary">
          Commencer le diagnostic
        </Link>
      </section>
    </div>
  );
}
