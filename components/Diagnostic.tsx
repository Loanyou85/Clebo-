"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { QUESTIONS, racesProposees, type ChoixDiagnostic, type ReponsesDiagnostic } from "@/lib/diagnostic";
import { contientSujetSensible } from "@/lib/securite";
import DiagnosticQuestion from "./DiagnosticQuestion";
import DiagnosticResult, { type PlanPersonnalise } from "./DiagnosticResult";
import ProgressLine from "./ProgressLine";

interface DiagnosticProps {
  races: Array<{ slug: string; name: string }>;
  /** En mode hero, la première question est déjà affichée par la page
   *  d'accueil : on démarre donc directement à la question suivante. */
  reponseInitiale?: string;
}

export default function Diagnostic({ races, reponseInitiale }: DiagnosticProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(reponseInitiale ? 1 : 0);
  const [reponses, setReponses] = useState<ReponsesDiagnostic>(
    reponseInitiale ? { probleme: reponseInitiale } : {}
  );
  const [saisieLibre, setSaisieLibre] = useState("");
  const [plan, setPlan] = useState<PlanPersonnalise | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const question = QUESTIONS[index];
  const progression = plan ? 1 : index / QUESTIONS.length;

  // La question "race" tire ses réponses de la base plutôt que d'une liste
  // figée : les races créées par les clients apparaissent donc aussi.
  const choix: ChoixDiagnostic[] =
    question?.id === "race"
      ? [
          ...racesProposees(races).map((race) => ({ valeur: race.slug, label: race.name })),
          { valeur: "autre", label: "Une autre race ou un croisé" },
        ]
      : (question?.choix ?? []);

  async function terminer(reponsesCompletes: ReponsesDiagnostic) {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reponsesCompletes),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErreur(data.error ?? "Une erreur est survenue, réessaie.");
        setChargement(false);
        return;
      }
      if (data.sensible) {
        router.push("/diagnostic/securite");
        return;
      }
      setPlan(data.plan);
    } catch {
      setErreur("Impossible de contacter le serveur, réessaie.");
    }
    setChargement(false);
  }

  function repondre(option: ChoixDiagnostic) {
    if (option.sensible) {
      router.push("/diagnostic/securite");
      return;
    }

    const suivantes = { ...reponses, [question.id]: option.valeur };
    setReponses(suivantes);
    setSaisieLibre("");

    if (index + 1 >= QUESTIONS.length) {
      void terminer(suivantes);
      return;
    }
    setIndex(index + 1);
  }

  function repondreLibre() {
    const valeur = saisieLibre.trim();
    if (!valeur) return;
    if (contientSujetSensible(valeur)) {
      router.push("/diagnostic/securite");
      return;
    }
    repondre({ valeur, label: valeur });
  }

  if (plan) {
    return <DiagnosticResult plan={plan} />;
  }

  return (
    <div>
      <ProgressLine progress={progression} className="mb-8" />

      <p className="text-sm text-sourdine mb-2">
        Question {index + 1} sur {QUESTIONS.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <DiagnosticQuestion question={question.question} choix={choix} onChoisir={repondre}>
            {question.id === "race" && (
              <div className="mt-4">
                <label htmlFor="race-libre" className="block text-sm font-semibold mb-2">
                  Ou écris sa race
                </label>
                <div className="flex gap-2">
                  <input
                    id="race-libre"
                    type="text"
                    value={saisieLibre}
                    onChange={(event) => setSaisieLibre(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        repondreLibre();
                      }
                    }}
                    className="input-field"
                    placeholder="ex : croisé berger australien"
                  />
                  <button type="button" onClick={repondreLibre} className="btn-outline shrink-0">
                    Valider
                  </button>
                </div>
              </div>
            )}
          </DiagnosticQuestion>
        </motion.div>
      </AnimatePresence>

      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          className="mt-6 text-sm font-semibold text-sourdine hover:text-texte transition-colors"
        >
          Revenir à la question précédente
        </button>
      )}

      {chargement && <p className="mt-6 text-sm text-sourdine">On construit ton plan…</p>}
      {erreur && <p className="mt-6 text-sm text-red-700">{erreur}</p>}
    </div>
  );
}
