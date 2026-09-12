// Source unique pour les races du MVP : utilisée par le script de
// génération des images placeholder ET par le seed de la base. Ajouter
// une race plus tard = ajouter une entrée ici (+ relancer les deux
// scripts), aucune autre modification de code nécessaire.

export interface BreedSeed {
  slug: string;
  name: string;
  hue: number; // teinte HSL utilisée pour l'illustration placeholder
  description: string;
  temperament: string;
  weightMinKg: number;
  weightMaxKg: number;
}

export const BREEDS: BreedSeed[] = [
  {
    slug: "labrador",
    name: "Labrador Retriever",
    hue: 32,
    description:
      "Chien de famille par excellence, énergique et très facile à motiver à la nourriture, ce qui en fait une des races les plus simples à dresser.",
    temperament: "Sociable, joueur, très gourmand, excellent avec les enfants.",
    weightMinKg: 25,
    weightMaxKg: 36,
  },
  {
    slug: "berger-australien",
    name: "Berger Australien",
    hue: 205,
    description:
      "Chien de troupeau très intelligent et athlétique, a besoin d'un travail mental et physique quotidien pour s'épanouir.",
    temperament: "Vif, endurant, très attaché à son maître, parfois réservé avec les inconnus.",
    weightMinKg: 16,
    weightMaxKg: 32,
  },
  {
    slug: "berger-allemand",
    name: "Berger Allemand",
    hue: 25,
    description:
      "Race polyvalente utilisée en garde, protection et assistance, apprend vite grâce à sa grande capacité de concentration.",
    temperament: "Loyal, protecteur, confiant, nécessite une sociabilisation précoce.",
    weightMinKg: 22,
    weightMaxKg: 40,
  },
  {
    slug: "golden-retriever",
    name: "Golden Retriever",
    hue: 45,
    description:
      "Chien de rapport doux et patient, très orienté vers l'humain, un des choix les plus recommandés pour un premier chien.",
    temperament: "Doux, patient, sociable, tolérant.",
    weightMinKg: 25,
    weightMaxKg: 34,
  },
  {
    slug: "jack-russell",
    name: "Jack Russell Terrier",
    hue: 5,
    description:
      "Petit chien de chasse au terrier, débordant d'énergie, a besoin d'un dressage cohérent dès le plus jeune âge pour canaliser son tempérament.",
    temperament: "Vif, têtu, courageux, excellent instinct de chasse.",
    weightMinKg: 5,
    weightMaxKg: 8,
  },
  {
    slug: "bouledogue-francais",
    name: "Bouledogue Français",
    hue: 280,
    description:
      "Petit molosse calme adapté à la vie en appartement, sensible aux méthodes douces, se lasse vite des exercices répétitifs.",
    temperament: "Affectueux, calme, un brin têtu, très attaché au foyer.",
    weightMinKg: 8,
    weightMaxKg: 14,
  },
  {
    slug: "chihuahua",
    name: "Chihuahua",
    hue: 320,
    description:
      "Le plus petit gabarit canin, souvent sous-estimé au dressage alors qu'il apprend vite avec de la constance et de courtes séances.",
    temperament: "Vif, méfiant envers les inconnus, très attaché à une personne.",
    weightMinKg: 1.5,
    weightMaxKg: 3,
  },
  {
    slug: "border-collie",
    name: "Border Collie",
    hue: 140,
    description:
      "Considéré comme la race la plus intelligente, conçu pour le travail de troupeau, a un besoin quotidien intense de stimulation mentale.",
    temperament: "Hyper intelligent, hyperactif si sous-stimulé, très sensible.",
    weightMinKg: 12,
    weightMaxKg: 20,
  },
  {
    slug: "cavalier-king-charles",
    name: "Cavalier King Charles",
    hue: 350,
    description:
      "Épagneul de compagnie doux et affectueux, apprend facilement les bases mais reste sensible aux méthodes trop fermes.",
    temperament: "Doux, sociable, peu d'instinct de garde, adore le contact humain.",
    weightMinKg: 5,
    weightMaxKg: 8,
  },
  {
    slug: "husky-siberien",
    name: "Husky Sibérien",
    hue: 210,
    description:
      "Chien de traîneau endurant, indépendant, nécessite un rappel travaillé intensivement en raison d'un fort instinct de fugue.",
    temperament: "Indépendant, endurant, peu enclin à obéir sans motivation forte.",
    weightMinKg: 16,
    weightMaxKg: 27,
  },
  {
    slug: "staffordshire-bull-terrier",
    name: "Staffordshire Bull Terrier",
    hue: 15,
    description:
      "Molosse musclé et joueur, très sociable envers l'humain, la sociabilisation avec les autres chiens doit être travaillée tôt.",
    temperament: "Joueur, courageux, très attaché à sa famille.",
    weightMinKg: 11,
    weightMaxKg: 17,
  },
  {
    slug: "beagle",
    name: "Beagle",
    hue: 35,
    description:
      "Chien de chasse à courre au flair exceptionnel, facilement distrait par les odeurs, demande de la patience au rappel.",
    temperament: "Joyeux, têtu, très guidé par son nez.",
    weightMinKg: 9,
    weightMaxKg: 11,
  },
  {
    slug: "shih-tzu",
    name: "Shih Tzu",
    hue: 260,
    description:
      "Petit chien de compagnie originaire de Chine, calme et affectueux, adapté à un dressage doux et progressif.",
    temperament: "Calme, affectueux, indépendant par moments.",
    weightMinKg: 4,
    weightMaxKg: 7,
  },
  {
    slug: "cocker-spaniel",
    name: "Cocker Spaniel",
    hue: 40,
    description:
      "Chien de chasse à la truffe et rapporteur d'origine anglaise, sensible et attaché à l'harmonie familiale.",
    temperament: "Doux, sensible, sociable, orienté vers l'odorat.",
    weightMinKg: 12,
    weightMaxKg: 16,
  },
  {
    slug: "croise",
    name: "Chien croisé / Autre race",
    hue: 160,
    description:
      "Chaque chien croisé est unique : ses besoins d'exercice et son gabarit dépendent surtout des races dominantes et de sa morphologie.",
    temperament: "Variable selon les races d'origine — observez le comportement individuel de votre chien.",
    weightMinKg: 5,
    weightMaxKg: 40,
  },
];
