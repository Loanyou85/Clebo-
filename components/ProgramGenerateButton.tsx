"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProgramGenerateButtonProps {
  programSlug: string;
  total: number;
  attendu: number;
}

/**
 * Génère les séances par lots de 10. Chaque clic fait un appel à l'IA :
 * c'est volontaire, ça tient dans la durée d'une fonction serverless et
 * l'avancement reste visible.
 */
export default function ProgramGenerateButton({ programSlug, total, attendu }: ProgramGenerateButtonProps) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function generer() {
    setChargement(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErreur(data.error ?? "La génération a échoué, réessaie.");
        setChargement(false);
        return;
      }
      setMessage(
        data.termine
          ? `Programme complet : ${data.total} séances. Il est maintenant en vente.`
          : `${data.total} séances sur ${data.attendu}. Relance pour les suivantes.`
      );
      router.refresh();
    } catch {
      setErreur("Impossible de contacter le serveur, réessaie.");
    }
    setChargement(false);
  }

  const complet = total >= attendu;

  return (
    <div>
      <button
        type="button"
        onClick={generer}
        disabled={chargement || complet}
        className="btn-primary text-sm py-2 px-4"
      >
        {chargement
          ? "Génération en cours… (30 à 60 s)"
          : complet
            ? "Programme complet"
            : `Générer les 10 séances suivantes (${total}/${attendu})`}
      </button>
      {message && <p className="text-sm text-encre-doux mt-2">{message}</p>}
      {erreur && <p className="text-sm text-red-700 mt-2">{erreur}</p>}
    </div>
  );
}
