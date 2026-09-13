import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser, isActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const dogs = await prisma.dog.findMany({
    where: { userId: user.id },
    include: { breed: true },
    orderBy: { createdAt: "asc" },
  });
  const subscribed = isActiveSubscription(user);

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mon espace</h1>
          <p className="text-foreground-muted">{user.email}</p>
        </div>
        <div className="card-surface px-4 py-3 flex items-center gap-3">
          <span className={`badge ${subscribed ? "" : "opacity-60"}`}>
            {subscribed ? "Abonnement actif" : "Aucun abonnement actif"}
          </span>
          {!subscribed && (
            <Link href="/abonnement" className="btn-primary text-sm py-2 px-4">
              S&apos;abonner — 27,99€/mois
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold">Mes chiens</h2>
        <Link href="/chiens/nouveau" className="btn-primary text-sm py-2 px-4">
          + Ajouter un chien
        </Link>
      </div>

      {dogs.length === 0 ? (
        <div className="card-surface p-8 text-center text-foreground-muted">
          Tu n&apos;as pas encore enregistré de chien.{" "}
          <Link href="/chiens/nouveau" className="text-orange-dark font-semibold">
            Ajoute ton premier chien
          </Link>{" "}
          pour commencer son suivi de dressage.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dogs.map((dog) => (
            <Link key={dog.id} href={`/chiens/${dog.id}`} className="card-surface p-5 hover:border-orange transition-colors">
              {dog.breed && (
                <Image
                  src={dog.breed.imageUrl}
                  alt={dog.breed.name}
                  width={400}
                  height={200}
                  className="rounded-lg w-full h-32 object-cover mb-3"
                />
              )}
              <p className="font-display font-bold text-lg">{dog.name}</p>
              <p className="text-sm text-foreground-muted">
                {dog.breed?.name ?? "Race inconnue"} · {dog.weightKg} kg
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
