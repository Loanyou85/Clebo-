import Link from "next/link";
import Image from "next/image";

interface RaceVignette {
  slug: string;
  name: string;
  imageUrl: string;
}

/**
 * Carrousel de races en défilement continu, même mécanique que le bandeau
 * de réassurance (piste dupliquée, translation CSS, pause au survol).
 * Chaque vignette reste un vrai lien vers la fiche de race, qui est une
 * page indexable : le carrousel sert aussi le maillage interne.
 */
export default function CarrouselRaces({ races }: { races: RaceVignette[] }) {
  if (races.length === 0) return null;
  const piste = [...races, ...races];

  return (
    <div className="marquee">
      <div className="marquee-piste gap-4">
        {piste.map((race, index) => (
          <Link
            key={`${race.slug}-${index}`}
            href={`/races/${race.slug}`}
            className="panneau overflow-hidden w-[160px] shrink-0"
            tabIndex={index >= races.length ? -1 : undefined}
            aria-hidden={index >= races.length}
          >
            <Image
              src={race.imageUrl}
              alt={race.name}
              width={320}
              height={200}
              className="w-full h-24 object-cover"
            />
            <p className="p-3 text-sm font-semibold truncate">{race.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
