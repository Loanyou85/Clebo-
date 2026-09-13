import type { ExerciseLevel } from "@prisma/client";

export interface ExerciseSeed {
  slug: string;
  title: string;
  level: ExerciseLevel;
  description: string;
  repetitions: number;
  frequencyPerDay: number;
  durationWeeks: number;
  forAllBreeds: boolean;
  breedSlugs?: string[];
  imageUrl?: string;
  videoUrl?: string;
  // Requête utilisée par prisma/seed.ts pour trouver une vraie vidéo de
  // démonstration via l'API YouTube Data v3 (voir lib/youtubeSearch.ts),
  // uniquement si videoUrl ci-dessus n'est pas déjà renseigné à la main.
  videoSearchQuery?: string;
}

export const BASE_EXERCISES: ExerciseSeed[] = [
  {
    slug: "assis",
    title: "Assis",
    level: "OBEISSANCE_BASE",
    description:
      "Tenez une friandise près du nez du chien puis levez lentement la main au-dessus de sa tête : sa tête suit la main et son arrière-train se pose naturellement au sol. Dites \"assis\" au moment où il s'assoit, récompensez immédiatement. Ne répétez pas l'ordre plusieurs fois : dites-le une fois, attendez, récompensez.",
    repetitions: 5,
    frequencyPerDay: 3,
    durationWeeks: 2,
    forAllBreeds: true,
    imageUrl: "/exercises/assis.svg",
    videoSearchQuery: "apprendre à un chien à s'asseoir dressage",
  },
  {
    slug: "couche",
    title: "Couché",
    level: "OBEISSANCE_BASE",
    description:
      "Depuis la position assise, tenez une friandise au sol entre ses pattes avant puis éloignez-la lentement à l'horizontale : le chien suit avec le nez et se couche. Dites \"couché\" au moment exact où le ventre touche le sol.",
    repetitions: 5,
    frequencyPerDay: 3,
    durationWeeks: 3,
    forAllBreeds: true,
    imageUrl: "/exercises/couche.svg",
    videoSearchQuery: "apprendre à un chien à se coucher dressage",
  },
  {
    slug: "rappel-de-base",
    title: "Rappel de base",
    level: "RAPPEL",
    description:
      "Commencez en intérieur ou jardin clos, sans distraction. Reculez de quelques pas, appelez le prénom du chien puis \"au pied\" d'une voix joyeuse et récompensez généreusement dès qu'il arrive, même s'il met du temps. Ne jamais gronder un chien qui revient, même en retard : il associerait le rappel à une punition.",
    repetitions: 10,
    frequencyPerDay: 2,
    durationWeeks: 4,
    forAllBreeds: true,
    imageUrl: "/exercises/rappel.svg",
    videoSearchQuery: "dressage rappel chien débutant",
  },
  {
    slug: "marche-en-laisse-sans-tirer",
    title: "Marche en laisse sans tirer",
    level: "LAISSE",
    description:
      "Dès que la laisse se tend, arrêtez-vous complètement et attendez que le chien revienne vers vous ou détende la laisse avant de repartir. La régularité est clé : ne jamais avancer laisse tendue, même une fois, sous peine de renforcer le tirage.",
    repetitions: 1,
    frequencyPerDay: 2,
    durationWeeks: 6,
    forAllBreeds: true,
    imageUrl: "/exercises/laisse.svg",
    videoSearchQuery: "chien qui tire en laisse solution dressage",
  },
  {
    slug: "apprentissage-de-la-proprete",
    title: "Apprentissage de la propreté",
    level: "PROPRETE",
    description:
      "Sortez le chiot systématiquement au réveil, après chaque repas et après le jeu. Restez immobile et silencieux dehors, félicitez et récompensez dans les 3 secondes qui suivent le besoin fait dehors. Ne jamais punir un accident découvert après coup : le chien ne fait pas le lien.",
    repetitions: 6,
    frequencyPerDay: 6,
    durationWeeks: 4,
    forAllBreeds: true,
    imageUrl: "/exercises/proprete.svg",
    videoSearchQuery: "éducation propreté chiot dressage",
  },
  {
    slug: "socialisation-aux-autres-chiens",
    title: "Socialisation aux autres chiens",
    level: "SOCIALISATION",
    description:
      "Organisez des rencontres courtes (5-10 minutes) avec des chiens calmes et connus, en laisse détendue, dans un espace neutre. Terminez toujours la rencontre avant que le chien ne montre des signes de fatigue ou de stress.",
    repetitions: 1,
    frequencyPerDay: 1,
    durationWeeks: 8,
    forAllBreeds: true,
    imageUrl: "/exercises/socialisation.svg",
    videoSearchQuery: "socialisation chiot autres chiens conseils",
  },
  {
    slug: "reste-pas-bouger",
    title: "Pas bouger / \"Reste\"",
    level: "OBEISSANCE_BASE",
    description:
      "Chien assis, paume ouverte devant son museau, dites \"reste\" et reculez d'un pas. Revenez avant qu'il ne bouge et récompensez. Augmentez la distance et la durée très progressivement sur plusieurs séances.",
    repetitions: 5,
    frequencyPerDay: 2,
    durationWeeks: 3,
    forAllBreeds: true,
    imageUrl: "/exercises/reste.svg",
    videoSearchQuery: "dressage chien ordre reste pas bouger",
  },
  {
    slug: "rappel-avance-avec-distractions",
    title: "Rappel avancé avec distractions",
    level: "RAPPEL",
    description:
      "Pour les races à fort instinct de fugue ou de prédation : travaillez le rappel en extérieur avec des distractions croissantes (autres odeurs, présence d'autres chiens à distance), toujours en longe de 5-10m au début pour garder le contrôle avant de passer en liberté totale.",
    repetitions: 8,
    frequencyPerDay: 2,
    durationWeeks: 6,
    forAllBreeds: false,
    breedSlugs: ["border-collie", "berger-australien", "husky-siberien", "jack-russell"],
    imageUrl: "/exercises/rappel-avance.svg",
    videoSearchQuery: "dressage rappel chien avec distractions avancé",
  },
  {
    slug: "sociabilisation-renforcee",
    title: "Sociabilisation renforcée",
    level: "SOCIALISATION",
    description:
      "Pour les races à fort gabarit ou instinct de garde : exposition régulière et positive à des inconnus, enfants et environnements variés dès les premières semaines, pour prévenir toute réactivité liée à la méfiance plutôt qu'à l'agressivité.",
    repetitions: 1,
    frequencyPerDay: 1,
    durationWeeks: 10,
    forAllBreeds: false,
    breedSlugs: ["berger-allemand", "staffordshire-bull-terrier"],
    imageUrl: "/exercises/sociabilisation.svg",
    videoSearchQuery: "socialisation chien de garde inconnus dressage",
  },
  {
    slug: "canalisation-instinct-de-troupeau",
    title: "Canalisation de l'instinct de troupeau",
    level: "OBEISSANCE_BASE",
    description:
      "Pour les chiens de troupeau qui \"rabattent\" enfants ou vélos : proposez un exutoire structuré (jouet à rapporter, agility, frisbee) avant chaque sortie pour canaliser l'énergie, et travaillez un ordre \"stop\" ferme dès les premiers signes de comportement de rabattage.",
    repetitions: 5,
    frequencyPerDay: 1,
    durationWeeks: 6,
    forAllBreeds: false,
    breedSlugs: ["border-collie", "berger-australien"],
    imageUrl: "/exercises/troupeau.svg",
    videoSearchQuery: "chien de troupeau rabattage gérer instinct dressage",
  },
];
