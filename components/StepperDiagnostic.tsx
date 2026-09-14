"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, useReducedMotion } from "motion/react";
import { QUESTIONS } from "@/lib/diagnostic";

const TEXTE_MACHINE = "Il tire en laisse…";

/**
 * « Du diagnostic au premier résultat, en 3 étapes ».
 *
 * L'étape 1 n'est pas une capture : ce sont les VRAIS boutons de problème
 * du diagnostic, réellement cliquables, qui lancent le questionnaire. Le
 * faux champ au-dessus s'écrit tout seul à l'apparition pour montrer ce
 * qu'on attend du visiteur.
 */
export default function StepperDiagnostic() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.4 });
  const [tape, setTape] = useState("");

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) {
      setTape(TEXTE_MACHINE);
      return;
    }
    let index = 0;
    const minuteur = setInterval(() => {
      index += 1;
      setTape(TEXTE_MACHINE.slice(0, index));
      if (index >= TEXTE_MACHINE.length) clearInterval(minuteur);
    }, 55);
    return () => clearInterval(minuteur);
  }, [visible, reduceMotion]);

  const problemes = QUESTIONS[0].choix.filter((choix) => !choix.sensible);

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="panneau p-6">
        <p className="badge mb-4">Étape 01</p>
        <h3 className="titre text-titre-s mb-2">Tu dis ce qui ne va pas</h3>
        <p className="text-sourdine prose-clebo mb-5">
          Six questions, quarante secondes, sans créer de compte. Commence ici, c&apos;est le vrai
          diagnostic.
        </p>

        <div className="panneau-2 px-4 py-3 mb-4 font-mono text-sm text-sourdine">
          {tape}
          <motion.span
            aria-hidden
            className="inline-block w-[2px] h-4 align-middle bg-signal ml-0.5"
            animate={reduceMotion ? undefined : { opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {problemes.map((probleme) => (
            <button
              key={probleme.valeur}
              type="button"
              className="choix"
              onClick={() => router.push(`/diagnostic?probleme=${probleme.valeur}`)}
            >
              {probleme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panneau p-6">
        <p className="badge mb-4">Étape 02</p>
        <h3 className="titre text-titre-s mb-2">Tu reçois un programme daté</h3>
        <p className="text-sourdine prose-clebo">
          Trente jours, une séance par jour, dans l&apos;ordre. Chaque séance tient en dix minutes et
          te dit aussi l&apos;erreur à ne pas commettre ce jour-là.
        </p>
      </div>

      <div className="panneau p-6">
        <p className="badge mb-4">Étape 03</p>
        <h3 className="titre text-titre-s mb-2">Tu vois la courbe monter</h3>
        <p className="text-sourdine prose-clebo">
          Après chaque séance, tu notes le nombre de réussites sur dix. C&apos;est cette courbe qui
          te fait tenir le jour où tu as la flemme.
        </p>
      </div>
    </div>
  );
}
