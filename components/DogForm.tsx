"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SIZE_LABELS, ENVIRONMENT_LABELS, type DogInput } from "@/lib/dogSchema";
import BreedSearch, { type BreedOption } from "@/components/BreedSearch";

interface DogFormProps {
  breeds: BreedOption[];
  dogId?: string;
  initial?: Partial<DogInput> & { breedName?: string };
}

export default function DogForm({ breeds, dogId, initial }: DogFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [breedId, setBreedId] = useState(initial?.breedId ?? "");
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

    if (!breedId) {
      setError("Choisis ou crée la race de ton chien.");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      breedId,
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
        <label className="block text-sm font-semibold mb-1">Race</label>
        <BreedSearch
          breeds={breeds}
          initialQuery={initial?.breedName}
          onSelect={(b) => setBreedId(b.id)}
        />
        <p className="text-xs text-foreground-muted mt-1">
          Race introuvable ? Tape son nom et crée-la : l&apos;IA génère sa fiche complète et son guide
          de dressage (ça marche aussi pour un chien croisé, ex: &quot;Croisé Labrador / Border
          Collie&quot;).
        </p>
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
