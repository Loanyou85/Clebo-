"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteDogButton({ dogId }: { dogId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer ce chien et son historique ? Cette action est définitive.")) return;
    setLoading(true);
    const res = await fetch(`/api/dogs/${dogId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/app");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Suppression..." : "Supprimer ce chien"}
    </button>
  );
}
