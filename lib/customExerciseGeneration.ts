import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, AI_MODEL } from "./anthropic";

const contentSchema = z.object({
  description: z.string().min(60).max(1500),
  commonMistakes: z.string().min(30).max(800),
  durationWeeks: z.number().int().positive().max(52),
  videoSearchQuery: z.string().min(5).max(150),
});

export type CustomExerciseContent = z.infer<typeof contentSchema>;

export class CustomExerciseGenerationUnavailableError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY n'est pas configurée : impossible de générer cet exercice automatiquement.");
    this.name = "CustomExerciseGenerationUnavailableError";
  }
}

export interface CustomExerciseRequestInput {
  title: string;
  description: string;
  dogContext?: {
    breedName: string;
    size: string;
    ageMonths: number;
    environment: string;
  } | null;
}

// Génère le contenu complet d'un exercice sur-mesure demandé par un client
// (voir app/api/exercise-requests/route.ts) : jamais de vidéo réellement
// tournée ou trouvée par l'IA — impossible à produire de façon fiable —
// mais une requête de recherche YouTube pertinente est générée à la place
// (voir lib/youtubeSearch.ts), affichée comme un lien de recherche plutôt
// que comme une vidéo intégrée pour ne jamais prétendre à tort qu'un
// contenu précis a été vérifié.
export async function generateCustomExercise(input: CustomExerciseRequestInput): Promise<CustomExerciseContent> {
  const anthropic = getAnthropicClient();
  if (!anthropic) throw new CustomExerciseGenerationUnavailableError();

  const dogContextText = input.dogContext
    ? `Le chien concerné : race ${input.dogContext.breedName}, gabarit ${input.dogContext.size}, ${input.dogContext.ageMonths} mois, vit en ${input.dogContext.environment.toLowerCase()}.`
    : "Aucun chien précis n'est associé à cette demande : donne un guide généraliste.";

  const prompt = `Un client de Clebo (site de dressage canin en France) a demandé un exercice sur-mesure qui n'existe pas dans la bibliothèque de base du site.

Titre demandé : "${input.title}"
Description du client : "${input.description}"
${dogContextText}

Génère le contenu complet de cet exercice :
1. "description" : le déroulé complet et actionnable en français (8 à 15 phrases ou une liste), étape par étape, avec la fréquence et la durée des séances.
2. "commonMistakes" : ce qu'il ne faut surtout PAS faire pendant cet apprentissage (erreurs fréquentes des propriétaires, réactions à éviter), en français, 3 à 6 phrases.
3. "durationWeeks" : nombre de semaines réaliste pour que le chien acquière cet exercice.
4. "videoSearchQuery" : une requête de recherche courte et précise (en français) à utiliser sur YouTube pour trouver une vidéo de démonstration pertinente pour cet exercice précis.`;

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: "fournir_exercice",
        description: "Fournit le contenu complet de l'exercice sur-mesure.",
        input_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            commonMistakes: { type: "string" },
            durationWeeks: { type: "number" },
            videoSearchQuery: { type: "string" },
          },
          required: ["description", "commonMistakes", "durationWeeks", "videoSearchQuery"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "fournir_exercice" },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("L'IA n'a pas renvoyé de contenu exploitable pour cet exercice.");
  }

  return contentSchema.parse(toolUse.input);
}
