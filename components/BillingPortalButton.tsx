"use client";

import { useState } from "react";

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const data = await res.json();
    if (data.ok && data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-outline w-full">
      {loading ? "Redirection..." : "Gérer mon abonnement"}
    </button>
  );
}
