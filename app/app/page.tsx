import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProgressChart from "@/components/ProgressChart";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

export default async function EspacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/app");

  const [dogs, enrollments] = await Promise.all([
    prisma.dog.findMany({
      where: { userId: user.id },
      include: { breed: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        program: { select: { slug: true, title: true, durationDays: true } },
        dog: { select: { name: true } },
        sessions: { orderBy: { dayNumber: "asc" }, select: { dayNumber: true, successes: true } },
      },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="titre text-titre-m mb-8">Mon espace</h1>

      {enrollments.length === 0 ? (
        <div className="card-surface p-6 mb-10">
          <p className="font-semibold mb-2">Tu n&apos;as pas encore de programme en cours.</p>
          <p className="text-sm text-encre-doux mb-5 prose-clebo">
            Fais le diagnostic pour savoir lequel correspond au problème de ton chien. Les trois
            premiers jours sont gratuits.
          </p>
          <Link href="/diagnostic" className="btn-primary">
            Commencer le diagnostic
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-12">
          {enrollments.map((enrollment) => {
            const faites = enrollment.sessions.length;
            const prochainJour = Math.min(enrollment.program.durationDays, faites + 1);
            return (
              <div key={enrollment.id} className="card-surface p-6">
                <p className="text-sm text-encre-doux mb-1">{enrollment.dog.name}</p>
                <p className="font-semibold text-lg mb-4">{enrollment.program.title}</p>

                <div className="mb-5">
                  <ProgressChart points={enrollment.sessions} />
                </div>

                <p className="text-sm text-encre-doux mb-4">
                  {faites} séance{faites > 1 ? "s" : ""} faite{faites > 1 ? "s" : ""} sur{" "}
                  {enrollment.program.durationDays}
                </p>

                <Link href={`/app/programme/${enrollment.program.slug}`} className="btn-primary">
                  {faites === 0 ? "Commencer le jour 1" : `Continuer — jour ${prochainJour}`}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="titre text-titre-s mb-4">Mes chiens</h2>
      {dogs.length === 0 ? (
        <div className="card-surface p-6">
          <p className="text-sm text-encre-doux mb-4">
            Enregistre ton chien pour adapter les séances à sa race, son âge et son environnement.
          </p>
          <Link href="/chiens/nouveau" className="btn-outline">
            Ajouter mon chien
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dogs.map((dog) => (
            <Link
              key={dog.id}
              href={`/chiens/${dog.id}`}
              className="card-surface p-5 hover:border-encre transition-colors"
            >
              <p className="font-semibold">{dog.name}</p>
              <p className="text-sm text-encre-doux">
                {dog.breed?.name ?? "Race inconnue"} · {dog.weightKg} kg
              </p>
            </Link>
          ))}
          <Link href="/chiens/nouveau" className="btn-outline self-start">
            Ajouter un chien
          </Link>
        </div>
      )}
    </div>
  );
}
