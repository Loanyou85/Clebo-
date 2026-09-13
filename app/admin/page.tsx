import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminRequestActions from "@/components/AdminRequestActions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (!user.isAdmin) redirect("/app");

  const requests = await prisma.exerciseRequest.findMany({
    include: { user: { select: { email: true } }, dog: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold mb-2">Administration</h1>
      <p className="text-foreground-muted mb-8">
        La plupart des demandes sont générées automatiquement par l&apos;IA dès leur envoi. Celles listées
        ici n&apos;ont pas pu l&apos;être (clé IA non configurée ou erreur) : valide-les ou refuse-les manuellement.
      </p>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="card-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <p className="font-semibold">{req.title}</p>
                <p className="text-xs text-foreground-muted">
                  {req.user.email} {req.dog ? `· pour ${req.dog.name}` : ""} · {req.status}
                </p>
              </div>
              {req.status === "EN_ATTENTE" && <AdminRequestActions requestId={req.id} />}
            </div>
            <p className="text-sm text-foreground-muted">{req.description}</p>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-foreground-muted text-sm">Aucune demande pour le moment.</p>
        )}
      </div>
    </div>
  );
}
