"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Flèche courbe dessinée à la main, qui relie un texte à un élément
 * d'interface. Le tracé se dessine à l'apparition (stroke-dashoffset).
 */
export default function FlecheCourbe({
  className = "",
  miroir = false,
}: {
  className?: string;
  miroir?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      className={className}
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden
      style={miroir ? { transform: "scaleX(-1)" } : undefined}
    >
      <motion.path
        d="M6 8c34 6 58 22 66 46"
        stroke="var(--sourdine)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M64 44l8 10 12-4"
        stroke="var(--sourdine)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2, delay: 0.55 }}
      />
    </svg>
  );
}
