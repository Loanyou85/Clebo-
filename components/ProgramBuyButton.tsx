"use client";

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
  const prix = (priceCents / 100).toFixed(2).replace(".", ",");

  async function acheter() {
    if (!loggedIn) {
      router.push(`/inscription?next=/programmes/${programSlug}`);
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
