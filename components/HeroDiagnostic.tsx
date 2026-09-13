"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { QUESTIONS } from "@/lib/diagnostic";
import Diagnostic from "./Diagnostic";
import ProgressLine from "./ProgressLine";

interface HeroDiagnosticProps {
  races: Array<{ slug: string; name: string }>;
}

/**
 * Le hero EST le diagnostic : pas d'image d'illustration avec un titre et
 * deux boutons. Le visiteur agit dans les deux premières secondes au lieu
 * de lire. Au clic sur une réponse, la page bascule dans le questionnaire.
 */
export default function HeroDiagnostic({ races }: HeroDiagnosticProps) {
  const reduceMotion = useReducedMotion();
  const [probleme, setProbleme] = useState<string | null>(null);
  const premiereQuestion = QUESTIONS[0];

  if (probleme) {
    return (
      <div className="container-page py-12 max-w-2xl">
        <Diagnostic races={races} reponseInitiale={probleme} />
      </div>
    );
  }

  return (
    <div className="container-page pt-12 pb-20 max-w-2xl">
      <motion.h1
        className="titre text-titre-m md:text-titre-l mb-6"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        Ton chien marche en laisse sans tirer, en 30 jours.
      </motion.h1>

      <ProgressLine draw progress={1} className="mb-8" />

      <p className="text-lg font-semibold mb-5">{premiereQuestion.question}</p>

      <div className="flex flex-col gap-2">
        {premiereQuestion.choix.map((option, index) => (
          <motion.button
            key={option.valeur}
            type="button"
            className="choix"
            onClick={() => {
              if (option.sensible) {
                window.location.href = "/diagnostic/securite";
                return;
              }
              setProbleme(option.valeur);
            }}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.22, delay: 0.25 + index * 0.04, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      <p className="text-sm text-encre-doux mt-6">
        6 questions, 40 secondes, sans créer de compte.
      </p>
    </div>
  );
}
