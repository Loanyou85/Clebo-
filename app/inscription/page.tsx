import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function InscriptionPage() {
  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="font-display text-3xl font-extrabold mb-2">Créer un compte</h1>
      <p className="text-foreground-muted mb-8">
        Enregistre tes chiens et accède aux techniques de dressage adaptées à chaque race.
      </p>
      <div className="card-surface p-6">
        <Suspense>
          <AuthForm mode="inscription" />
        </Suspense>
      </div>
      <p className="text-sm text-foreground-muted mt-4">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="text-orange-dark font-semibold">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
