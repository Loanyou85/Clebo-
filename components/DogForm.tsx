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
          <input
            type="text"
            placeholder="Races dominantes connues (optionnel)"
            value={mixedBreedNote ?? ""}
            onChange={(e) => setMixedBreedNote(e.target.value)}
            className="input-field"
          />
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
