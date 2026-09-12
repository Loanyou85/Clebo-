"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface DogOption {
  id: string;
  name: string;
}

export default function ExerciseRequestForm({
  dogs,
  defaultDogId,
}: {
  dogs: DogOption[];
  defaultDogId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dogId, setDogId] = useState(defaultDogId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/exercise-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dogId: dogId || null }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setTitle("");
    setDescription("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {dogs.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-1">Pour quel chien ?</label>
          <select value={dogId} onChange={(e) => setDogId(e.target.value)} className="input-field">
            <option value="">Non spécifié</option>
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Titre de l&apos;exercice souhaité</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="ex: Apprendre à donner la patte"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Décris ce que tu veux que ton chien apprenne</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-700">
          Demande envoyée ! Elle apparaîtra ici une fois validée par notre équipe.
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Envoi..." : "Envoyer la demande"}
      </button>
    </form>
  );
}
