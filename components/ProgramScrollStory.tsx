"use client";

import { useEffect, useRef, useState } from "react";
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

  // La version à scroll figé et la version statique n'ont pas la même
  // structure DOM : basculer dès le premier rendu ferait échouer
  // l'hydratation (le serveur ne connaît pas la préférence du visiteur).
  // On rend donc d'abord la version statique, des deux côtés, puis on
  // passe à la version animée une fois monté.
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);

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

  // Sans mouvement (ou avant l'hydratation) : toutes les étapes à la
  // suite, sans scroll figé ni transformation.
  if (reduceMotion || !monte) {
    return (
      <section className="relative py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="halo top-0" />
        </div>
        <div className="container-page relative max-w-2xl">
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
    // Pas d'overflow-hidden ici : il ferait de la section un conteneur de
    // défilement, ce qui neutralise le position:sticky de l'enfant — la
    // carte défilerait au lieu de se figer et il resterait plusieurs
    // milliers de pixels de vide au milieu de la page. Le halo est donc
    // détouré par son propre conteneur juste en dessous.
    <section ref={conteneur} className="relative" style={{ height: `${etapes.length * 80}vh` }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="halo top-0" />
      </div>
      <div className="sticky top-0 min-h-screen flex items-center py-16">
        <div className="container-page relative max-w-2xl w-full">
          <EnTete />

          <div className="my-8">
            <div className="relative h-[3px] w-full rounded-full bg-surface-2 overflow-hidden">
              <motion.div className="absolute inset-y-0 left-0 bg-signal" style={{ width: largeurLigne }} />
            </div>
            <div className="flex justify-between text-sm text-sourdine mt-2">
              <span>Jour 1</span>
              <span>Jour {etapes[etapes.length - 1]?.dayNumber ?? 30}</span>
            </div>
          </div>

          <CarteJour etape={etape} />

          <p className="text-sm text-sourdine mt-6">
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
      <p className="prose-clebo text-sourdine">
        Pas un catalogue dans lequel se perdre : un calendrier. Chaque jour, un seul objectif, un
        seul exercice, et l&apos;erreur exacte à ne pas commettre ce jour-là.
      </p>
    </>
  );
}

function CarteJour({ etape }: { etape: Etape }) {
  return (
    <div className="card-surface p-6">
      <p className="text-sm text-sourdine mb-3">Jour {etape.dayNumber}</p>

      <p className="text-sm text-sourdine mb-1">Objectif</p>
      <p className="font-semibold text-lg mb-5">{etape.objective}</p>

      <p className="text-sm text-sourdine mb-5">
        {etape.durationMin} min · {etape.repetitions} répétitions
      </p>

      <p className="text-sm text-sourdine mb-1">L&apos;erreur classique</p>
      <p className="text-sm">{etape.commonMistake}</p>

      <div className="mt-6 flex items-center gap-3 text-sm font-semibold">
        <span aria-hidden className="inline-block h-5 w-5 rounded-[4px] border-2 border-signal" />
        Séance faite
      </div>
    </div>
  );
}
