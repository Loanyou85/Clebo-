"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"VALIDEE" | "REFUSEE" | null>(null);

  async function review(status: "VALIDEE" | "REFUSEE") {
    setLoading(status);
    await fetch(`/api/exercise-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => review("VALIDEE")}
        disabled={loading !== null}
        className="btn-primary text-sm py-1.5 px-3"
      >
        {loading === "VALIDEE" ? "..." : "Valider"}
      </button>
      <button
        onClick={() => review("REFUSEE")}
        disabled={loading !== null}
        className="btn-outline text-sm py-1.5 px-3"
      >
        {loading === "REFUSEE" ? "..." : "Refuser"}
      </button>
    </div>
  );
}
