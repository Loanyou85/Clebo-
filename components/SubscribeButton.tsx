"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscribeButton({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!loggedIn) {
      router.push("/inscription?next=/abonnement");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.ok || !data.url) {
      setError(data.error ?? "Impossible de démarrer le paiement.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className="btn-primary w-full">
        {loading ? "Redirection..." : "S'abonner — 27,99€/mois"}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
