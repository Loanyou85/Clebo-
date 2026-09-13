"use client";

import { useMemo, useState } from "react";

export interface BreedOption {
  id: string;
  slug: string;
  name: string;
}

interface BreedSearchProps {
  breeds: BreedOption[];
  onSelect: (breed: BreedOption) => void;
  placeholder?: string;
  initialQuery?: string;
}

export default function BreedSearch({ breeds, onSelect, placeholder, initialQuery }: BreedSearchProps) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return breeds.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, breeds]);

  const exactMatch = breeds.some((b) => b.name.toLowerCase() === query.trim().toLowerCase());

  function pick(breed: BreedOption) {
    onSelect(breed);
    setQuery(breed.name);
    setOpen(false);
  }

  async function createBreed() {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/breeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Impossible de créer cette race, réessaie.");
        setCreating(false);
        return;
      }
      pick(data.breed);
    } catch {
      setError("Impossible de contacter le serveur, réessaie.");
    }
    setCreating(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setError(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Cherche la race de ton chien..."}
        className="input-field"
        autoComplete="off"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full card-surface p-2 space-y-1 max-h-72 overflow-y-auto">
          {matches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => pick(b)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-light text-sm"
            >
              {b.name}
            </button>
          ))}

          {!exactMatch && (
            <button
              type="button"
              onClick={createBreed}
              disabled={creating}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-light text-sm font-semibold text-orange-dark disabled:opacity-50"
            >
              {creating
                ? "Analyse IA en cours..."
                : `+ Créer la race "${query.trim()}" (analyse IA)`}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
