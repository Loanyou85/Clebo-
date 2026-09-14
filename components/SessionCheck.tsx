"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface SessionCheckProps {
  programSlug: string;
  dogId: string;
  dayNumber: number;
  /** Score déjà enregistré si la séance a déjà été faite. */
  scoreExistant?: number | null;
}

/**
 * Validation d'une séance : la case se coche, puis on demande le score.
 * Une seule question — « combien de réussites sur 10 ? » — c'est ce qui
 * alimente la courbe de progression.
 */
export default function SessionCheck({ programSlug, dogId, dayNumber, scoreExistant }: SessionCheckProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [ouvert, setOuvert] = useState(false);
  const [score, setScore] = useState(scoreExistant ?? 7);
  const [enregistre, setEnregistre] = useState(scoreExistant != null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function valider() {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programSlug, dogId, dayNumber, successes: score }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErreur(data.error ?? "Impossible d'enregistrer la séance.");
        setChargement(false);
        return;
      }
      // Retour haptique court sur mobile : la séance est bien comptée.
      if (!reduceMotion && typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(18);
      }
      setEnregistre(true);
      setOuvert(false);
      router.refresh();
    } catch {
      setErreur("Impossible de contacter le serveur, réessaie.");
    }
    setChargement(false);
  }

  if (!ouvert) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="flex items-center gap-3 font-semibold"
          aria-pressed={enregistre}
        >
          <motion.span
            aria-hidden
            className={`inline-flex h-6 w-6 items-center justify-center rounded-[4px] border-2 ${
              enregistre ? "border-signal bg-signal text-texte" : "border-texte"
            }`}
            animate={enregistre && !reduceMotion ? { scale: [1, 1.18, 1] } : undefined}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {enregistre ? "✓" : ""}
          </motion.span>
          {enregistre ? `Séance faite — ${score}/10` : "Marquer la séance comme faite"}
        </button>
        {enregistre && (
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="text-sm text-sourdine hover:text-texte mt-2 transition-colors"
          >
            Corriger le score
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={`score-${dayNumber}`} className="block font-semibold mb-2">
        Combien de réussites sur 10 ?
      </label>
      <input
        id={`score-${dayNumber}`}
        type="range"
        min={0}
        max={10}
        step={1}
        value={score}
        onChange={(event) => setScore(Number(event.target.value))}
        className="w-full accent-[var(--signal)]"
      />
      <p className="titre text-titre-s my-3">{score}/10</p>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={valider} disabled={chargement} className="btn-primary">
          {chargement ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={() => setOuvert(false)} className="btn-outline">
          Annuler
        </button>
      </div>

      {erreur && <p className="text-sm text-red-700 mt-3">{erreur}</p>}
    </div>
  );
}
