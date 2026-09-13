"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BreedSearch, { type BreedOption } from "@/components/BreedSearch";

interface RaceBreed extends BreedOption {
  imageUrl: string;
  weightMinKg: number;
  weightMaxKg: number;
}

export default function RaceSearchSection({ breeds }: { breeds: RaceBreed[] }) {
  const router = useRouter();

  return (
    <div>
      <div className="max-w-md mb-8">
        <BreedSearch
          breeds={breeds}
          placeholder="Cherche une race (ex: Berger Allemand, Croisé Labrador...)"
          onSelect={(breed) => router.push(`/races/${breed.slug}`)}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {breeds.map((breed) => (
          <Link
            key={breed.id}
            href={`/races/${breed.slug}`}
            className="card-surface overflow-hidden hover:border-orange transition-colors"
          >
            <Image
              src={breed.imageUrl}
              alt={breed.name}
              width={400}
              height={240}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <p className="font-display font-bold">{breed.name}</p>
              <p className="text-xs text-foreground-muted">
                {breed.weightMinKg}–{breed.weightMaxKg} kg adulte
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
