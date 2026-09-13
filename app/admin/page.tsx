import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminRequestActions from "@/components/AdminRequestActions";
import ProgramGenerateButton from "@/components/ProgramGenerateButton";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (!user.isAdmin) redirect("/app");

  const [requests, programmes] = await Promise.all([
    prisma.exerciseRequest.findMany({
      include: { user: { select: { email: true } }, dog: { select: { name: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.program.findMany({
      orderBy: { title: "asc" },
      select: {
        slug: true,
        title: true,
        durationDays: true,
        published: true,
        _count: { select: { days: true, purchases: true } },
      },
    }),
  ]);

  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="titre text-titre-m mb-8">Administration</h1>

      <section className="mb-12">
        <h2 className="titre text-titre-s mb-2">Programmes</h2>
        <p className="text-sm text-encre-doux mb-5 prose-clebo">
          Un programme n&apos;est mis en vente qu&apos;une fois ses séances générées. Chaque clic
          génère 10 séances : il en faut donc 3 par programme. Tu peux relire et corriger chaque
          séance ensuite.
        </p>
        <div className="flex flex-col gap-3">
          {programmes.map((programme) => (
            <div key={programme.slug} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold">{programme.title}</p>
                  <p className="text-sm text-encre-doux">
                    {programme._count.days}/{programme.durationDays} séances ·{" "}
                    {programme.published ? "en vente" : "pas encore en vente"} ·{" "}
                    {programme._count.purchases} achat{programme._count.purchases > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ProgramGenerateButton
                programSlug={programme.slug}
                total={programme._count.days}
                attendu={programme.durationDays}
              />
            </div>
          ))}
        </div>
      </section>

      <h2 className="titre text-titre-s mb-2">Demandes d&apos;exercices</h2>
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
