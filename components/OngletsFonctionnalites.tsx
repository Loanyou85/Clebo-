"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface Onglet {
  id: string;
  label: string;
  titre: string;
  texte: string;
  points: string[];
}

/**
 * Onglets de fonctionnalités : l'indicateur glisse d'un onglet à l'autre
 * (layoutId), le contenu change en fondu croisé de 200 ms.
 *
 * Les onglets ne présentent que des fonctionnalités RÉELLEMENT en ligne :
 * annoncer ici le retour vidéo ou le mode foyer, qui n'existent pas
 * encore, serait une promesse fausse sur une page de vente.
 */
export default function OngletsFonctionnalites({ onglets }: { onglets: Onglet[] }) {
  const reduceMotion = useReducedMotion();
  const [actif, setActif] = useState(onglets[0]?.id);
  const courant = onglets.find((onglet) => onglet.id === actif) ?? onglets[0];

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2 mb-6">
        {onglets.map((onglet) => (
          <button
            key={onglet.id}
            role="tab"
            aria-selected={onglet.id === actif}
            onClick={() => setActif(onglet.id)}
            className="relative px-4 py-2 text-sm font-semibold rounded-[var(--r-petit)]"
          >
            {onglet.id === actif && (
              <motion.span
                layoutId="onglet-actif"
                className="absolute inset-0 rounded-[var(--r-petit)] bg-surface-2 border border-bordure"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span className={`relative ${onglet.id === actif ? "text-texte" : "text-sourdine"}`}>
              {onglet.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={courant.id}
          className="panneau p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <h3 className="titre text-titre-s mb-3">{courant.titre}</h3>
          <p className="text-sourdine prose-clebo mb-5">{courant.texte}</p>
          <ul className="flex flex-col gap-2">
            {courant.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm">
                <span aria-hidden className="text-pousse font-bold">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
