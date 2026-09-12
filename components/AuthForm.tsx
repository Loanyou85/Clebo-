"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface AuthFormProps {
  mode: "inscription" | "connexion";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoint = mode === "inscription" ? "/api/auth/register" : "/api/auth/login";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur, réessaie.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={mode === "inscription" ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          autoComplete={mode === "inscription" ? "new-password" : "current-password"}
        />
        {mode === "inscription" && (
          <p className="text-xs text-foreground-muted mt-1">8 caractères minimum.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Chargement..." : mode === "inscription" ? "Créer mon compte" : "Se connecter"}
      </button>
    </form>
  );
}
