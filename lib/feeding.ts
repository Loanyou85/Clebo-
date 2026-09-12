// Calculateur alimentation/eau pour un chien enregistré, à partir de son
// poids et de son âge. Formules vétérinaires standards, volontairement
// simples et transparentes (pas de "boîte noire") :
//
// - Besoin énergétique au repos (RER) = 70 * poids(kg)^0.75 (kcal/jour)
// - Multiplicateur d'activité selon l'âge et l'environnement de vie
//   (un chiot ou un chien qui vit en maison/campagne dépense plus qu'un
//   adulte en appartement citadin)
// - Conversion kcal -> grammes de croquettes en supposant ~3500 kcal/kg
//   (densité énergétique moyenne d'une croquette adulte standard)
// - Eau : ~60 ml par kg de poids corporel et par jour (fourchette basse
//   des recommandations vétérinaires usuelles, à ajuster selon chaleur/
//   activité)

import type { Dog } from "@prisma/client";

const KCAL_PER_KG_KIBBLE = 3500;
const WATER_ML_PER_KG_PER_DAY = 60;

function activityMultiplier(dog: Pick<Dog, "ageMonths" | "environment">): number {
  const isPuppy = dog.ageMonths < 12;
  if (isPuppy) return 2.5;

  const isSenior = dog.ageMonths >= 84; // 7 ans+
  const base = dog.environment === "CAMPAGNE" || dog.environment === "MAISON" ? 1.6 : 1.4;
  return isSenior ? base - 0.2 : base;
}

export interface FeedingPlan {
  dailyKcal: number;
  dailyFoodGrams: number;
  dailyWaterLiters: number;
  mealsPerDay: number;
}

export function computeFeedingPlan(
  dog: Pick<Dog, "weightKg" | "ageMonths" | "environment">
): FeedingPlan {
  const rer = 70 * Math.pow(dog.weightKg, 0.75);
  const dailyKcal = rer * activityMultiplier(dog);
  const dailyFoodGrams = (dailyKcal / KCAL_PER_KG_KIBBLE) * 1000;
  const dailyWaterLiters = (dog.weightKg * WATER_ML_PER_KG_PER_DAY) / 1000;
  const mealsPerDay = dog.ageMonths < 6 ? 4 : dog.ageMonths < 12 ? 3 : 2;

  return {
    dailyKcal: Math.round(dailyKcal),
    dailyFoodGrams: Math.round(dailyFoodGrams),
    dailyWaterLiters: Math.round(dailyWaterLiters * 10) / 10,
    mealsPerDay,
  };
}
