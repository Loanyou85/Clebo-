import ProgressChart from "./ProgressChart";

const PROGRESSION_EXEMPLE = [
  { dayNumber: 1, successes: 4 },
  { dayNumber: 4, successes: 5 },
  { dayNumber: 8, successes: 6 },
  { dayNumber: 12, successes: 7 },
  { dayNumber: 18, successes: 8 },
  { dayNumber: 24, successes: 9 },
];

/**
 * Aperçu de l'espace connecté, rendu en direct avec les composants réels
 * du produit plutôt qu'avec une image.
 *
 * Une capture d'écran figée serait fausse dès la première modification de
 * l'interface, et la seule qu'on puisse prendre aujourd'hui montrerait des
 * séances de test. Ici c'est la vraie interface, avec un exemple de
 * progression annoncé comme tel.
 */
export default function ApercuEspace() {
  return (
    <div className="panneau p-6 md:p-8">
      <div className="grid md:grid-cols-[1fr_1fr] gap-8">
        <div>
          <p className="text-sm text-sourdine mb-1">Rex · Marche en laisse sans tirer</p>
          <p className="titre text-titre-s mb-4">Jour 12 sur 30</p>

          <div className="h-[3px] w-full rounded-full bg-surface-2 overflow-hidden mb-6">
            <div className="h-full w-[40%] bg-signal" />
          </div>

          <div className="panneau-2 p-5">
            <p className="text-sm text-sourdine mb-1">Objectif du jour</p>
            <p className="font-semibold mb-4">
              Il tient dix pas laisse détendue dans le couloir, sans distraction.
            </p>
            <p className="text-sm text-sourdine mb-4">8 min · 5 répétitions</p>

            <div className="border-t border-bordure pt-4 mb-5">
              <p className="text-sm font-semibold mb-1">L&apos;erreur à ne pas commettre</p>
              <p className="text-sm text-sourdine">
                Avancer laisse tendue « juste une fois » parce qu&apos;on est pressé : ça annule le
                travail des onze jours précédents.
              </p>
            </div>

            <div className="flex items-center gap-3 font-semibold text-sm">
              <span
                aria-hidden
                className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] bg-signal text-sur-signal"
              >
                ✓
              </span>
              Séance faite — 8/10
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-4">La progression de Rex</p>
          <ProgressChart points={PROGRESSION_EXEMPLE} />
          <p className="text-sm text-sourdine mt-6">
            Exemple de progression sur trois semaines. Ta courbe se construit à partir de tes propres
            séances.
          </p>
        </div>
      </div>
    </div>
  );
}
