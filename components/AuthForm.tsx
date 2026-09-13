"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface AuthFormProps {
  mode: "inscription" | "connexion";
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_indisponible: "La connexion avec Google n'est pas disponible pour le moment.",
  oauth_echec: "La connexion a échoué, réessaie.",
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoint = mode === "inscription" ? "/api/auth/register" : "/api/auth/login";
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthError = searchParams.get("error");
  const oauthErrorMessage = oauthError ? OAUTH_ERROR_MESSAGES[oauthError] ?? "La connexion a échoué, réessaie." : null;

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
    <div className="space-y-5">
      <div className="space-y-3">
        <a
          href={`/api/auth/google?next=${encodeURIComponent(next)}`}
          className="btn-outline w-full justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.99v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.99A9 9 0 0 0 0 9c0 1.45.35 2.83.99 4.03z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .99 4.97l2.96 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          Continuer avec Google
        </a>
      </div>

      {oauthErrorMessage && <p className="text-sm text-red-600 text-center">{oauthErrorMessage}</p>}

      <div className="flex items-center gap-3 text-xs text-foreground-muted">
        <div className="h-px flex-1 bg-black/10" />
        ou par email
        <div className="h-px flex-1 bg-black/10" />
      </div>

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
    </div>
  );
}
