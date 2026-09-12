import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function ConnexionPage() {
  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="font-display text-3xl font-extrabold mb-2">Connexion</h1>
      <p className="text-foreground-muted mb-8">Retrouve tes chiens et ton suivi de dressage.</p>
      <div className="card-surface p-6">
        <Suspense>
          <AuthForm mode="connexion" />
        </Suspense>
      </div>
      <p className="text-sm text-foreground-muted mt-4">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-orange-dark font-semibold">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
