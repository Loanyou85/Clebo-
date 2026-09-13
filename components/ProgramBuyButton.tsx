"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProgramBuyButtonProps {
  programSlug: string;
  priceCents: number;
  loggedIn: boolean;
}

export default function ProgramBuyButton({ programSlug, priceCents, loggedIn }: ProgramBuyButtonProps) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  // Le contenu étant fourni immédiatement, la loi impose de recueillir une
  // renonciation EXPRESSE au droit de rétractation de 14 jours (article
  // L221-28 13° du Code de la consommation). Sans cette case cochée, pas
  // d'accès au paiement — et la garantie 30 jours reste acquise par-dessus.
  const [renonciation, setRenonciation] = useState(false);
  const prix = (priceCents / 100).toFixed(2).replace(".", ",");

  async function acheter() {
    if (!loggedIn) {
      router.push(`/inscription?next=/programmes/${programSlug}`);
      return;
    }
    if (!renonciation) {
      setErreur("Coche la case pour obtenir l'accès immédiat au programme.");
      return;
    }

    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/checkout/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.url) {
        setErreur(data.error ?? "Le paiement est indisponible, réessaie.");
        setChargement(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setErreur("Impossible de contacter le serveur, réessaie.");
      setChargement(false);
    }
  }

  return (
    <div>
      {loggedIn && (
        <label className="flex gap-3 items-start text-sm text-encre-doux mb-4 prose-clebo cursor-pointer">
          <input
            type="checkbox"
            checked={renonciation}
            onChange={(event) => {
              setRenonciation(event.target.checked);
              setErreur(null);
            }}
            className="mt-1 h-4 w-4 accent-[var(--signal)] shrink-0"
          />
          <span>
            Je demande l&apos;accès immédiat au programme et je renonce à mon droit de rétractation
            de 14 jours, comme le prévoient les{" "}
            <Link href="/cgv" className="text-signal-texte font-semibold">
              conditions générales de vente
            </Link>
            . La garantie « satisfait ou remboursé 30 jours » s&apos;applique quand même.
          </span>
        </label>
      )}

      <button type="button" onClick={acheter} disabled={chargement} className="btn-primary w-full sm:w-auto">
        {chargement ? "Ouverture du paiement…" : `Commencer le programme — ${prix} €`}
      </button>
      <p className="text-sm text-encre-doux mt-3">
        Paiement unique, accès à vie. Satisfait ou remboursé pendant 30 jours.
      </p>
      {erreur && <p className="text-sm text-red-700 mt-2">{erreur}</p>}
    </div>
  );
}
