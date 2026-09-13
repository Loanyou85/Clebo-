import type { ProblemeType } from "@prisma/client";

/**
 * Le diagnostic est le cœur de la conversion : 6 questions, une par écran,
 * sans compte. Le compte n'est demandé qu'à la toute fin, pour sauvegarder
 * le plan déjà affiché.
 */

export interface ChoixDiagnostic {
  valeur: string;
  label: string;
  /** Sort du tunnel de vente vers /diagnostic/securite. */
  sensible?: boolean;
}

export interface QuestionDiagnostic {
  id: "probleme" | "race" | "age" | "depuis" | "essaye" | "temps";
  question: string;
  /** Saisie libre autorisée en plus des choix (analysée par lib/securite.ts). */
  choix: ChoixDiagnostic[];
}

export const QUESTIONS: QuestionDiagnostic[] = [
  {
    id: "probleme",
    question: "Quel est le problème numéro un avec ton chien ?",
    choix: [
      { valeur: "LAISSE", label: "Il tire en laisse" },
      { valeur: "RAPPEL", label: "Il ne revient pas quand j'appelle" },
      { valeur: "ABOIEMENT", label: "Il aboie tout le temps" },
      { valeur: "SOLITUDE", label: "Il détruit quand je pars" },
      { valeur: "SAUT", label: "Il saute sur les gens" },
      { valeur: "PROPRETE", label: "Il n'est pas propre" },
      { valeur: "SENSIBLE", label: "Il grogne, pince ou mord", sensible: true },
    ],
  },
  {
    id: "race",
    question: "Quelle est sa race ?",
    choix: [], // rempli depuis la base : liste des races + saisie libre
  },
  {
    id: "age",
    question: "Quel âge a-t-il ?",
    choix: [
      { valeur: "3", label: "Moins de 6 mois" },
      { valeur: "9", label: "6 mois à 1 an" },
      { valeur: "24", label: "1 à 3 ans" },
      { valeur: "60", label: "3 à 7 ans" },
      { valeur: "108", label: "Plus de 7 ans" },
    ],
  },
  {
    id: "depuis",
    question: "Depuis combien de temps ça dure ?",
    choix: [
      { valeur: "Moins d'un mois", label: "Moins d'un mois" },
      { valeur: "Quelques mois", label: "Quelques mois" },
      { valeur: "Plus d'un an", label: "Plus d'un an" },
      { valeur: "Depuis toujours", label: "Depuis toujours" },
    ],
  },
  {
    id: "essaye",
    question: "Qu'as-tu déjà essayé ?",
    choix: [
      { valeur: "Rien de structuré", label: "Rien de structuré pour l'instant" },
      { valeur: "Vidéos YouTube", label: "Des vidéos sur YouTube" },
      { valeur: "Conseils de proches", label: "Les conseils de proches" },
      { valeur: "Éducateur canin", label: "Un éducateur canin" },
      { valeur: "Matériel anti-traction", label: "Du matériel (harnais, collier…)" },
    ],
  },
  {
    id: "temps",
    question: "Combien de temps peux-tu y consacrer par jour ?",
    choix: [
      { valeur: "5", label: "5 minutes" },
      { valeur: "10", label: "10 minutes" },
      { valeur: "20", label: "20 minutes ou plus" },
    ],
  },
];

/** Races les plus fréquentes en France, proposées en premier dans le
 *  diagnostic : un ordre alphabétique ferait disparaître le Labrador et le
 *  Golden au profit du Beagle et du Berger Allemand. Toute race absente se
 *  saisit librement juste en dessous. */
export const RACES_COURANTES = [
  "labrador",
  "golden-retriever",
  "berger-australien",
  "berger-allemand",
  "jack-russell",
  "bouledogue-francais",
  "cavalier-king-charles",
  "border-collie",
];

/** Le catalogue contient une entrée « Chien croisé » héritée de la
 *  première version du site : elle ferait doublon avec le choix explicite
 *  « Une autre race ou un croisé ». */
const RACES_EXCLUES = new Set(["croise"]);

export function racesProposees<T extends { slug: string }>(races: T[], limite = 8): T[] {
  const disponibles = races.filter((race) => !RACES_EXCLUES.has(race.slug));
  const courantes = RACES_COURANTES.map((slug) => disponibles.find((race) => race.slug === slug)).filter(
    (race): race is T => Boolean(race)
  );
  const reste = disponibles.filter((race) => !RACES_COURANTES.includes(race.slug));
  return [...courantes, ...reste].slice(0, limite);
}

export interface ReponsesDiagnostic {
  probleme?: string;
  race?: string;
  age?: string;
  depuis?: string;
  essaye?: string;
  temps?: string;
}

/** Chaque problème mène à un programme. L'aboiement n'a pas encore de
 *  programme dédié : on renvoie vers celui de la solitude, qui traite la
 *  cause la plus fréquente (aboiement de détresse quand le chien est seul). */
export const PROGRAMME_PAR_PROBLEME: Record<ProblemeType, string> = {
  LAISSE: "marche-en-laisse",
  RAPPEL: "rappel-fiable",
  SOLITUDE: "rester-seul",
  PROPRETE: "proprete-chiot",
  SAUT: "arreter-de-sauter",
  ABOIEMENT: "rester-seul",
};

export function programmeRecommande(probleme: string): string | null {
  return PROGRAMME_PAR_PROBLEME[probleme as ProblemeType] ?? null;
}

export function estProblemeConnu(valeur: string): valeur is ProblemeType {
  return valeur in PROGRAMME_PAR_PROBLEME;
}
