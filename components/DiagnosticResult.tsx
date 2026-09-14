"use client";

import Link from "next/link";
import ProgressLine from "./ProgressLine";

export interface PlanPersonnalise {
  programSlug: string;
  programTitle: string;
  promise: string;
  summary: string;
  durationDays: number;
  priceCents: number;
  /** Les 3 premières séances en clair : c'est le moment « ah, ça parle
   *  vraiment de mon chien ». Le reste du programme est flouté. */
  premieresSeances: Array<{
    dayNumber: number;
    objective: string;
    durationMin: number;
    repetitions: number;
  }>;
  seancesRestantes: number;
  minutesPerDay: number | null;
}

export default function DiagnosticResult({ plan }: { plan: PlanPersonnalise }) {
  const prix = (plan.priceCents / 100).toFixed(2).replace(".", ",");

  return (
    <div>
      <ProgressLine progress={1} className="mb-8" />

      <p className="badge mb-4">Ton plan est prêt</p>
      <h2 className="titre text-titre-m mb-3">{plan.promise}</h2>
      <p className="prose-clebo text-sourdine mb-8">{plan.summary}</p>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-8">
        <span>
          <strong>{plan.durationDays} jours</strong> de programme
        </span>
        <span>
          <strong>{plan.minutesPerDay ?? 10} minutes</strong> par jour
        </span>
        <span>
          <strong>1 séance</strong> par jour, jamais deux
        </span>
      </div>

      {plan.premieresSeances.length > 0 ? (
        <div className="flex flex-col gap-3 mb-4">
          {plan.premieresSeances.map((seance) => (
            <div key={seance.dayNumber} className="card-surface p-5">
              <p className="text-sm text-sourdine mb-1">Jour {seance.dayNumber}</p>
              <p className="font-semibold mb-2">{seance.objective}</p>
              <p className="text-sm text-sourdine">
                {seance.durationMin} min · {seance.repetitions} répétitions
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface p-5 mb-4">
          <p className="text-sm text-sourdine">
            Les séances de ce programme arrivent très bientôt. Crée ton compte pour être prévenu dès
            qu&apos;il est disponible.
          </p>
        </div>
      )}

      {plan.seancesRestantes > 0 && (
        <div className="card-surface p-5 mb-8 relative overflow-hidden">
          <div aria-hidden className="blur-[6px] select-none pointer-events-none">
            <p className="text-sm text-sourdine mb-1">Jour 4</p>
            <p className="font-semibold mb-2">On augmente la distance avec la même consigne.</p>
            <p className="text-sm text-sourdine">8 min · 5 répétitions</p>
          </div>
          <p className="mt-4 text-sm font-semibold">
            + {plan.seancesRestantes} séances jusqu&apos;au jour {plan.durationDays}
          </p>
        </div>
      )}

      <div className="card-surface p-6">
        <p className="font-semibold mb-2">Sauvegarde ton plan</p>
        <p className="text-sm text-sourdine mb-5 prose-clebo">
          Crée ton compte pour retrouver ce plan, suivre tes séances jour par jour et voir la
          progression de ton chien. Les 3 premiers jours sont gratuits.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/inscription?next=/programmes/${plan.programSlug}`} className="btn-primary">
            Créer mon compte gratuitement
          </Link>
          <Link href={`/programmes/${plan.programSlug}`} className="btn-outline">
            Voir le programme — {prix} €
          </Link>
        </div>
      </div>
    </div>
  );
}
