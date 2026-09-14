"use client";

import { motion, useReducedMotion } from "motion/react";

interface ProgressLineProps {
  /** Avancement de 0 à 1. */
  progress?: number;
  /** Trace la ligne à l'arrivée sur la page (hero uniquement). */
  draw?: boolean;
  className?: string;
}

/**
 * Le motif visuel signature de Clebo : un trait orange continu qui se
 * remplit à mesure. C'est le seul élément décoratif autorisé par la
 * direction artistique, précisément parce qu'il porte une information
 * (l'avancement) et n'est jamais posé pour faire joli.
 */
export default function ProgressLine({ progress = 1, draw = false, className = "" }: ProgressLineProps) {
  const reduceMotion = useReducedMotion();
  const largeur = Math.max(0, Math.min(1, progress));

  return (
    <div className={`relative h-[3px] w-full overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 bg-signal"
        initial={draw && !reduceMotion ? { width: 0 } : false}
        animate={{ width: `${largeur * 100}%` }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : draw
              ? { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
              : { type: "spring", stiffness: 220, damping: 18 }
        }
      />
    </div>
  );
}
