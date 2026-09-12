import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

const STEPS = [
  {
    title: "Enregistre ton chien",
    text: "Race (ou croisé), taille, poids, âge et environnement de vie : tout est adapté à son profil.",
  },
  {
    title: "Suis les exercices recommandés",
    text: "Techniques de dressage détaillées avec texte, images et vidéo, avec le nombre de répétitions et la fréquence à respecter.",
  },
  {
    title: "Nourris-le au bon rythme",
    text: "Calcul automatique des quantités de croquettes et d'eau selon son poids, avec les marques conseillées pour sa race.",
  },
];

export default async function HomePage() {
  const breeds = await prisma.breed.findMany({ orderBy: { name: "asc" }, take: 8 });

  return (
    <div>
      <section className="container-page py-16 md:py-24 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold max-w-3xl mx-auto leading-tight">
          Dresse ton chien, <span className="text-orange">étape par étape</span>
        </h1>
        <p className="text-foreground-muted text-lg mt-5 max-w-xl mx-auto">
          Techniques de dressage adaptées à chaque race, conseils alimentation personnalisés, et
          le module pour demander l&apos;exercice que tu veux vraiment apprendre à ton chien.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link href="/inscription" className="btn-primary">
            Créer mon compte
          </Link>
          <Link href="/races" className="btn-outline">
            Voir les races
          </Link>
        </div>
        <p className="text-sm text-foreground-muted mt-4">27,99€/mois, sans engagement caché.</p>
      </section>

      <section className="container-page py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card-surface p-6">
              <div className="badge mb-3">Étape {i + 1}</div>
              <h2 className="font-display font-bold text-lg mb-2">{step.title}</h2>
              <p className="text-sm text-foreground-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Toutes les races, un dressage adapté</h2>
          <Link href="/races" className="text-orange-dark font-semibold text-sm">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {breeds.map((breed) => (
            <Link key={breed.id} href={`/races/${breed.slug}`} className="group">
              <Image
                src={breed.imageUrl}
                alt={breed.name}
                width={300}
                height={220}
                className="w-full h-28 object-cover rounded-xl group-hover:opacity-90 transition-opacity"
              />
              <p className="text-sm font-semibold mt-2">{breed.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="card-surface p-10 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold mb-2">Une seule offre, tout inclus</h2>
          <p className="font-display text-4xl font-extrabold text-orange-dark mb-4">27,99€/mois</p>
          <Link href="/abonnement" className="btn-primary">
            Découvrir l&apos;offre
          </Link>
        </div>
      </section>
    </div>
  );
}
