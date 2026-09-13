"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";

interface Etape {
  dayNumber: number;
  objective: string;
  durationMin: number;
  repetitions: number;
  commonMistake: string;
}

/**
 * La section mémorable de la page d'accueil : le conteneur se fige pendant
 * que le scroll fait avancer les jours 1 → 30 et remplit la ligne orange.
 * C'est aussi la démonstration du produit : on montre un calendrier, pas
 * un catalogue.
 */
export default function ProgramScrollStory({ etapes }: { etapes: Etape[] }) {
  const reduceMotion = useReducedMotion();
  const conteneur = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: conteneur,
    offset: ["start start", "end end"],
  });

  const largeurLigne = useTransform(scrollYProgress, [0, 1], ["4%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (valeur) => {
    const prochain = Math.min(etapes.length - 1, Math.floor(valeur * etapes.length));
    setIndex((actuel) => (actuel === prochain ? actuel : prochain));
  });

  const etape = etapes[index] ?? etapes[0];
  if (!etape) return null;

  // Sans mouvement : on affiche simplement toutes les étapes à la suite,
  // sans scroll figé ni transformation.
  if (reduceMotion) {
    return (
      <section className="surface-foret py-16">
        <div className="container-page max-w-2xl">
          <EnTete />
          <div className="flex flex-col gap-4 mt-8">
            {etapes.map((e) => (
              <CarteJour key={e.dayNumber} etape={e} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={conteneur} className="surface-foret relative" style={{ height: `${etapes.length * 80}vh` }}>
      <div className="sticky top-0 min-h-screen flex items-center py-16">
        <div className="container-page max-w-2xl w-full">
          <EnTete />

          <div className="my-8">
            <div className="relative h-[3px] w-full rounded-full bg-white/15 overflow-hidden">
              <motion.div className="absolute inset-y-0 left-0 bg-signal" style={{ width: largeurLigne }} />
            </div>
            <div className="flex justify-between text-sm text-foret-doux mt-2">
              <span>Jour 1</span>
              <span>Jour {etapes[etapes.length - 1]?.dayNumber ?? 30}</span>
            </div>
          </div>

          <CarteJour etape={etape} />

          <p className="text-sm text-foret-doux mt-6">
            Les jours à venir restent verrouillés. On ne saute pas le jour 12.
          </p>
        </div>
      </div>
    </section>
  );
}

function EnTete() {
  return (
    <>
      <h2 className="titre text-titre-m mb-4">30 jours. Une séance de 8 minutes par jour.</h2>
      <p className="prose-clebo text-foret-doux">
        Pas un catalogue dans lequel se perdre : un calendrier. Chaque jour, un seul objectif, un
        seul exercice, et l&apos;erreur exacte à ne pas commettre ce jour-là.
      </p>
    </>
  );
}

function CarteJour({ etape }: { etape: Etape }) {
  return (
    <div className="card-surface p-6">
      <p className="text-sm text-foret-doux mb-3">Jour {etape.dayNumber}</p>

      <p className="text-sm text-foret-doux mb-1">Objectif</p>
      <p className="font-semibold text-lg mb-5">{etape.objective}</p>

      <p className="text-sm text-foret-doux mb-5">
        {etape.durationMin} min · {etape.repetitions} répétitions
      </p>

      <p className="text-sm text-foret-doux mb-1">L&apos;erreur classique</p>
      <p className="text-sm">{etape.commonMistake}</p>

      <div className="mt-6 flex items-center gap-3 text-sm font-semibold">
        <span aria-hidden className="inline-block h-5 w-5 rounded-[4px] border-2 border-signal" />
        Séance faite
      </div>
    </div>
  );
}
