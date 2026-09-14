"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/** Compteur qui s'incrémente une seule fois, à sa première apparition. */
export default function Counter({ valeur, duree = 900 }: { valeur: number; duree?: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-10%" });
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion || valeur === 0) {
      setAffiche(valeur);
      return;
    }

    const debut = performance.now();
    let frame = 0;

    const avancer = (maintenant: number) => {
      const ratio = Math.min(1, (maintenant - debut) / duree);
      setAffiche(Math.round(valeur * ratio));
      if (ratio < 1) frame = requestAnimationFrame(avancer);
    };

    frame = requestAnimationFrame(avancer);
    return () => cancelAnimationFrame(frame);
  }, [visible, valeur, duree, reduceMotion]);

  return (
    <span ref={ref} className="font-semibold text-texte">
      {affiche}
    </span>
  );
}
