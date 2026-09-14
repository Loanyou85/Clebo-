"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface Question {
  question: string;
  reponse: string;
}

/** Une seule question ouverte à la fois, hauteur animée sur 240 ms. */
export default function FaqAccordeon({ questions }: { questions: Question[] }) {
  const reduceMotion = useReducedMotion();
  const [ouverte, setOuverte] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {questions.map((item, index) => {
        const estOuverte = ouverte === index;
        return (
          <div key={item.question} className="panneau overflow-hidden">
            <button
              type="button"
              onClick={() => setOuverte(estOuverte ? null : index)}
              aria-expanded={estOuverte}
              className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold"
            >
              {item.question}
              <motion.span
                aria-hidden
                animate={{ rotate: estOuverte ? 180 : 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.24 }}
                className="text-sourdine shrink-0"
              >
                ⌄
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {estOuverte && (
                <motion.div
                  key="contenu"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="px-5 pb-5 text-sourdine prose-clebo">{item.reponse}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
