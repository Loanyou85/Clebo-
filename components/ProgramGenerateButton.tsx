"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProgramGenerateButtonProps {
  programSlug: string;
  total: number;
  attendu: number;
}

/**
 * Un seul clic génère tout le programme, mais en enchaînant plusieurs
 * requêtes courtes : une fonction serverless est coupée à 60 secondes, et
 * générer 30 séances en un appel dépasserait ce délai. L'avancement
 * s'affiche au fur et à mesure.
 */
export default function ProgramGenerateButton({ programSlug, total, attendu }: ProgramGenerateButtonProps) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [avancement, setAvancement] = useState(total);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function generer() {
    setChargement(true);
    setErreur(null);
    setMessage(null);

    // Garde-fou : sans elle, une erreur inattendue côté serveur ferait
    // tourner la boucle indéfiniment.
    const maxTours = Math.ceil(attendu / 2) + 2;

    for (let tour = 0; tour < maxTours; tour++) {
      let data;
      try {
        const res = await fetch("/api/admin/programs/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ programSlug }),
        });
        data = await res.json();
        if (!res.ok || !data.ok) {
          setErreur(data.error ?? "La génération a échoué. Reclique pour reprendre où ça s'est arrêté.");
          break;
        }
      } catch {
        setErreur("Connexion interrompue. Reclique pour reprendre où ça s'est arrêté.");
        break;
      }

      setAvancement(data.total);

      if (data.termine) {
        setMessage(`Programme complet : ${data.total} séances. Il est maintenant en vente.`);
        break;
      }
      setMessage(`${data.total} séances sur ${data.attendu}…`);
    }

    setChargement(false);
    router.refresh();
  }

  const complet = avancement >= attendu;

  return (
    <div>
      <button
        type="button"
        onClick={generer}
        disabled={chargement || complet}
        className="btn-primary text-sm py-2 px-4"
      >
        {chargement
          ? `Génération en cours… ${avancement}/${attendu}`
          : complet
            ? "Programme complet"
            : avancement > 0
              ? `Reprendre la génération (${avancement}/${attendu})`
              : "Générer les séances"}
      </button>

      {chargement && (
        <p className="text-sm text-encre-doux mt-2">
          Laisse cet onglet ouvert, ça prend quelques minutes pour un programme entier.
        </p>
      )}
      {message && !chargement && <p className="text-sm text-encre-doux mt-2">{message}</p>}
      {erreur && <p className="text-sm text-red-700 mt-2">{erreur}</p>}
    </div>
  );
}
