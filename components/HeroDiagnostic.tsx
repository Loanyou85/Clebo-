"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { QUESTIONS } from "@/lib/diagnostic";
import Diagnostic from "./Diagnostic";
import Marquee from "./Marquee";
import Telephone from "./decor/Telephone";
import { Clicker, Friandise, Laisse, Medaille } from "./decor/ObjetsFlottants";

interface HeroDiagnosticProps {
  races: Array<{ slug: string; name: string }>;
  /** Nombre réel de chiens accompagnés. Aucun chiffre n'est affiché tant
   *  qu'il n'y a personne : annoncer « +50 000 » en démarrant à zéro est
   *  une pratique commerciale trompeuse (article L121-2). */
  chiensAccompagnes: number;
}

const REASSURANCE = [
  "Sans carte bancaire",
  "10 minutes par jour",
  "Adapté à ta race",
  "Garantie 30 jours",
  "Résultats mesurés",
];

/**
 * Le hero EST le diagnostic : le visiteur agit dans les deux premières
 * secondes au lieu de lire. Tout le décor (halo, téléphone, objets) est
 * autour, jamais devant les six réponses.
 */
export default function HeroDiagnostic({ races, chiensAccompagnes }: HeroDiagnosticProps) {
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

  const apparition = (delai: number) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay: delai, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative overflow-hidden">
      <div className="halo top-0" aria-hidden />

      <div className="container-page relative pt-10 pb-16">
        {/* minmax(0, …) et min-w-0 : sans ça, la piste du bandeau défilant
            (largeur max-content) impose sa largeur à toute la colonne et le
            titre déborde de l'écran sur mobile. */}
        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 items-center">
          <div className="max-w-2xl min-w-0">
            <motion.p className="badge mb-6" {...apparition(0)}>
              <span aria-hidden>🐾</span>
              {chiensAccompagnes > 0
                ? `${chiensAccompagnes} chien${chiensAccompagnes > 1 ? "s" : ""} accompagné${chiensAccompagnes > 1 ? "s" : ""}`
                : "Programmes de 30 jours, jour par jour"}
            </motion.p>

            <motion.h1 className="titre text-titre-m md:text-titre-l mb-6" {...apparition(0.08)}>
              Ton chien arrête de tirer en laisse.{" "}
              <span className="text-signal-texte">En 30 jours, 10 minutes par jour.</span>
            </motion.h1>

            <motion.p className="text-lg font-semibold mb-5" {...apparition(0.16)}>
              {premiereQuestion.question}
            </motion.p>

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
                      : { duration: 0.22, delay: 0.24 + index * 0.04, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  {option.label}
                </motion.button>
              ))}
            </div>

            <motion.div className="mt-8" {...apparition(0.6)}>
              <Marquee items={REASSURANCE} />
            </motion.div>
          </div>

          {/* Décor : retiré sous 768px, où il ne ferait que ralentir le
              premier affichage sur un réseau mobile. */}
          <motion.div
            className="decor-desktop relative h-[460px] min-w-0"
            initial={reduceMotion ? false : { opacity: 0, y: 40, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Telephone className="absolute left-1/2 -translate-x-1/2 flotte" rotation={-4}>
              <p className="text-[11px] text-sourdine mb-1">Jour 12 sur 30</p>
              <div className="h-[3px] w-full rounded-full bg-bordure mb-3 overflow-hidden">
                <div className="h-full w-[40%] bg-signal" />
              </div>
              <p className="text-[13px] font-semibold leading-snug mb-3">
                Il tient 10 pas laisse détendue dans le couloir.
              </p>
              <div className="rounded-[8px] bg-surface border border-bordure p-2 mb-3">
                <p className="text-[10px] text-sourdine mb-1">L&apos;erreur du jour</p>
                <p className="text-[11px] leading-snug">
                  Avancer laisse tendue « juste une fois » annule la semaine.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] bg-signal text-sur-signal text-[9px]">
                  ✓
                </span>
                Séance faite — 8/10
              </div>
            </Telephone>

            {/* En orbite serrée autour du téléphone : dispersés dans le
                cadre, ils ne se rattachent visuellement à rien. */}
            <Friandise className="left-[8%] top-16" delai={0} />
            <Clicker className="right-[8%] top-28" delai={1.2} />
            <Laisse className="left-[12%] bottom-28" delai={2.1} />
            <Medaille className="right-[10%] bottom-20" delai={0.7} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
