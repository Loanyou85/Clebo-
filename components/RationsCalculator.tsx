"use client";

import { useState } from "react";
import { computeFeedingPlan } from "@/lib/feeding";
import { ENVIRONMENT_LABELS, type DogInput } from "@/lib/dogSchema";

/**
 * Calculateur libre, utilisable sans compte : c'est une page d'entrée SEO
 * gratuite, elle ne doit jamais demander à se connecter pour donner un
 * résultat. Le calcul tourne entièrement dans le navigateur.
 */
export default function RationsCalculator() {
  const [poids, setPoids] = useState("");
  const [age, setAge] = useState("");
  const [environnement, setEnvironnement] = useState<DogInput["environment"]>("MAISON");

  const poidsNum = Number(poids);
  const ageNum = Number(age);
  const valide = poidsNum > 0 && poidsNum <= 120 && ageNum >= 0 && ageNum <= 300 && age !== "";

  const plan = valide
    ? computeFeedingPlan({ weightKg: poidsNum, ageMonths: ageNum, environment: environnement })
    : null;

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label htmlFor="poids" className="block text-sm font-semibold mb-2">
            Poids (kg)
          </label>
          <input
            id="poids"
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={poids}
            onChange={(event) => setPoids(event.target.value)}
            className="input-field"
            placeholder="ex : 25"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-semibold mb-2">
            Âge (en mois)
          </label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            min="0"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            className="input-field"
            placeholder="ex : 18"
          />
        </div>

        <div>
          <label htmlFor="environnement" className="block text-sm font-semibold mb-2">
            Lieu de vie
          </label>
          <select
            id="environnement"
            value={environnement}
            onChange={(event) => setEnvironnement(event.target.value as DogInput["environment"])}
            className="input-field"
          >
            {Object.entries(ENVIRONMENT_LABELS).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {plan ? (
        <div className="card-surface p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-encre-doux mb-1">Croquettes par jour</p>
              <p className="titre text-titre-s">{plan.dailyFoodGrams} g</p>
            </div>
            <div>
              <p className="text-sm text-encre-doux mb-1">Eau par jour</p>
              <p className="titre text-titre-s">{plan.dailyWaterLiters} L</p>
            </div>
            <div>
              <p className="text-sm text-encre-doux mb-1">Repas par jour</p>
              <p className="titre text-titre-s">{plan.mealsPerDay}</p>
            </div>
            <div>
              <p className="text-sm text-encre-doux mb-1">Besoin énergétique</p>
              <p className="titre text-titre-s">{plan.dailyKcal} kcal</p>
            </div>
          </div>

          <p className="text-sm text-encre-doux mt-6 prose-clebo">
            Estimation pour une croquette adulte standard (environ 3 500 kcal/kg) : vérifie la
            densité indiquée sur ton sac, elle change la quantité. À ajuster avec ton vétérinaire en
            cas de croissance, de gestation, de stérilisation ou de maladie.
          </p>
        </div>
      ) : (
        <div className="card-surface p-6">
          <p className="text-sm text-encre-doux">
            Entre le poids et l&apos;âge de ton chien pour obtenir ses quantités.
          </p>
        </div>
      )}
    </div>
  );
}
