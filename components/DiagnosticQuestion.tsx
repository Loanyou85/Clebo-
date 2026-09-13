"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ChoixDiagnostic } from "@/lib/diagnostic";

interface DiagnosticQuestionProps {
  question: string;
  choix: ChoixDiagnostic[];
  onChoisir: (choix: ChoixDiagnostic) => void;
  /** Cascade rapide à l'arrivée : 40 ms entre chaque réponse. */
  cascade?: boolean;
  children?: React.ReactNode;
}

export default function DiagnosticQuestion({
  question,
  choix,
  onChoisir,
  cascade = true,
  children,
}: DiagnosticQuestionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <p className="text-lg font-semibold mb-5 prose-clebo">{question}</p>

      <div className="flex flex-col gap-2">
        {choix.map((option, index) => (
          <motion.button
            key={option.valeur}
            type="button"
            onClick={() => onChoisir(option)}
            className="choix"
            initial={cascade && !reduceMotion ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.22, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {children}
    </div>
  );
}
