import { prisma } from "./prisma";

// Races "effectives" d'un chien pour les recommandations (exercices,
// nourriture) : sa race déclarée si connue, sinon les races détectées par
// l'analyse IA de son mélange (mixedBreedNote) si disponibles, sinon
// aucune (l'appelant retombe alors sur les recommandations "toutes races").
export async function getEffectiveBreedIds(dog: {
  breedId: string | null;
  aiMatchedBreedSlugs: string[];
}): Promise<string[]> {
  if (dog.breedId) return [dog.breedId];
  if (dog.aiMatchedBreedSlugs.length === 0) return [];

  const breeds = await prisma.breed.findMany({
    where: { slug: { in: dog.aiMatchedBreedSlugs } },
    select: { id: true },
  });
  return breeds.map((b) => b.id);
}
