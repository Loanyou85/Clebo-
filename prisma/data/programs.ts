import type { ProblemeType } from "@prisma/client";

export interface ProgramSeed {
  slug: string;
  title: string;
  probleme: ProblemeType;
  /** Le titre nomme un résultat, jamais une fonctionnalité. */
  promise: string;
  summary: string;
  durationDays: number;
  /** Les exercices distincts du programme. Une seule vidéo est cherchée
   *  par exercice (et non par jour) : 30 recherches YouTube par programme
   *  dépasseraient le quota gratuit de l'API. */
  exercises: string[];
}

export const PROGRAMS: ProgramSeed[] = [
  {
    slug: "marche-en-laisse",
    title: "Marche en laisse sans tirer",
    probleme: "LAISSE",
    promise: "Ton chien marche en laisse sans tirer, en 30 jours",
    summary:
      "La laisse tendue est le problème numéro un des propriétaires en ville. Ce programme reconstruit la marche depuis le salon jusqu'au trottoir bondé, sans collier de dressage et sans forcer.",
    durationDays: 30,
    exercises: [
      "marche en laisse détendue en intérieur",
      "changement de direction en laisse",
      "arrêt dès que la laisse se tend",
      "marche au pied avec distractions",
      "passage devant un autre chien en laisse",
    ],
  },
  {
    slug: "rappel-fiable",
    title: "Rappel fiable",
    probleme: "RAPPEL",
    promise: "Ton chien revient quand tu l'appelles, même dehors, en 30 jours",
    summary:
      "Un chien qui ne revient pas, c'est un chien qui ne sort jamais en liberté. Ce programme construit un rappel qui tient face aux odeurs, aux autres chiens et aux joggeurs.",
    durationDays: 30,
    exercises: [
      "rappel en intérieur sans distraction",
      "rappel au jardin avec une longe",
      "rappel avec distraction légère",
      "rappel d'urgence avec un mot dédié",
      "rappel en extérieur en liberté",
    ],
  },
  {
    slug: "rester-seul",
    title: "Rester seul sans détruire",
    probleme: "SOLITUDE",
    promise: "Ton chien reste seul sans détruire ni hurler, en 30 jours",
    summary:
      "La solitude s'apprend par paliers de quelques secondes, pas en partant une journée entière. Ce programme monte progressivement la durée d'absence sans jamais déclencher la panique.",
    durationDays: 30,
    exercises: [
      "désensibilisation aux signaux de départ",
      "absence de quelques secondes",
      "absence de plusieurs minutes",
      "occupation autonome avant le départ",
      "absence longue et retour neutre",
    ],
  },
  {
    slug: "proprete-chiot",
    title: "Propreté du chiot",
    probleme: "PROPRETE",
    promise: "Ton chiot est propre, sans accident la nuit, en 30 jours",
    summary:
      "La propreté n'est pas une question de punition mais de rythme de sorties et de timing de récompense. Ce programme cale les sorties sur les besoins réels du chiot.",
    durationDays: 30,
    exercises: [
      "sorties au réveil et après les repas",
      "récompense dans les trois secondes",
      "gestion des accidents sans punition",
      "propreté la nuit",
      "signal pour demander à sortir",
    ],
  },
  {
    slug: "arreter-de-sauter",
    title: "Arrêter de sauter sur les gens",
    probleme: "SAUT",
    promise: "Ton chien accueille les invités sans sauter, en 30 jours",
    summary:
      "Un chien saute parce que ça marche : il obtient de l'attention. Ce programme remplace le saut par un comportement incompatible, tenu même quand la sonnette retentit.",
    durationDays: 30,
    exercises: [
      "quatre pattes au sol pour obtenir l'attention",
      "assis pour dire bonjour",
      "tapis d'accueil à la porte",
      "gestion de la sonnette",
      "accueil d'un invité inconnu",
    ],
  },
];
