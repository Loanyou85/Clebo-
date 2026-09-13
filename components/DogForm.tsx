"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SIZE_LABELS, ENVIRONMENT_LABELS, type DogInput } from "@/lib/dogSchema";

interface BreedOption {
  id: string;
  name: string;
}

interface DogFormProps {
  breeds: BreedOption[];
  dogId?: string;
  initial?: Partial<DogInput>;
}

export default function DogForm({ breeds, dogId, initial }: DogFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [isMixed, setIsMixed] = useState(initial?.isMixed ?? false);
  const [breedId, setBreedId] = useState(initial?.breedId ?? breeds[0]?.id ?? "");
  const [mixedBreedNote, setMixedBreedNote] = useState(initial?.mixedBreedNote ?? "");
  const [characteristics, setCharacteristics] = useState(initial?.characteristics ?? "");
  const [size, setSize] = useState<DogInput["size"]>(initial?.size ?? "MOYEN");
  const [weightKg, setWeightKg] = useState(initial?.weightKg?.toString() ?? "");
  const [ageMonths, setAgeMonths] = useState(initial?.ageMonths?.toString() ?? "");
  const [environment, setEnvironment] = useState<DogInput["environment"]>(
    initial?.environment ?? "MAISON"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      isMixed,
      breedId: isMixed ? null : breedId || null,
      mixedBreedNote: isMixed ? mixedBreedNote : null,
      characteristics: isMixed ? characteristics : null,
      size,
      weightKg: Number(weightKg),
      ageMonths: Number(ageMonths),
      environment,
    };

    try {
      const res = await fetch(dogId ? `/api/dogs/${dogId}` : "/api/dogs", {
        method: dogId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      router.push(dogId ? `/chiens/${dogId}` : `/chiens/${data.dogId}`);
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur, réessaie.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-1">Nom du chien</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
          <input
            type="checkbox"
            checked={isMixed}
            onChange={(e) => setIsMixed(e.target.checked)}
            className="h-4 w-4"
          />
          Chien croisé / race inconnue
        </label>

        {isMixed ? (
          <div>
            <input
              type="text"
              placeholder="Races dominantes connues (ex: Berger Allemand et Labrador)"
              value={mixedBreedNote ?? ""}
              onChange={(e) => setMixedBreedNote(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-foreground-muted mt-1 mb-3">
              Optionnel, mais recommandé : une IA analyse cette description pour adapter le
              programme de dressage de {name || "ton chien"} aux races qui s&apos;en rapprochent.
            </p>

            <label className="block text-sm font-semibold mb-1">
              Caractéristiques particulières (optionnel)
            </label>
            <textarea
              rows={3}
              placeholder="ex: très joueur, un peu peureux avec les autres chiens, adore l'eau..."
              value={characteristics ?? ""}
              onChange={(e) => setCharacteristics(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-foreground-muted mt-1">
              Plus tu donnes de détails (comportement, poids, taille déjà renseignés ci-dessous),
              plus l&apos;analyse IA du programme de dressage sera précise.
            </p>
          </div>
        ) : (
          <select
            value={breedId}
            onChange={(e) => setBreedId(e.target.value)}
            className="input-field"
          >
            {breeds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Taille</label>
          <select value={size} onChange={(e) => setSize(e.target.value as DogInput["size"])} className="input-field">
            {Object.entries(SIZE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Environnement de vie</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as DogInput["environment"])}
            className="input-field"
          >
            {Object.entries(ENVIRONMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            required
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Âge (en mois)</label>
          <input
            type="number"
            min="0"
            required
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
            className="input-field"
            placeholder="ex: 18 pour 1 an et demi"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Enregistrement..." : dogId ? "Enregistrer les modifications" : "Ajouter mon chien"}
      </button>
    </form>
  );
}
