import { z } from "zod";

export const dogSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(60),
  breedId: z.string().min(1).nullable(),
  isMixed: z.boolean(),
  mixedBreedNote: z.string().trim().max(200).optional().nullable(),
  size: z.enum(["PETIT", "MOYEN", "GRAND"]),
  weightKg: z.coerce.number().positive("Le poids doit être positif.").max(120),
  ageMonths: z.coerce.number().int().min(0).max(300),
  environment: z.enum(["CAMPAGNE", "VILLE", "APPARTEMENT", "MAISON"]),
});

export type DogInput = z.infer<typeof dogSchema>;

export const SIZE_LABELS: Record<DogInput["size"], string> = {
  PETIT: "Petit",
  MOYEN: "Moyen",
  GRAND: "Grand",
};

export const ENVIRONMENT_LABELS: Record<DogInput["environment"], string> = {
  CAMPAGNE: "Campagne",
  VILLE: "Ville",
  APPARTEMENT: "Appartement",
  MAISON: "Maison",
};
