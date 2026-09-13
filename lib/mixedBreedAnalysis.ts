import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, MIXED_BREED_ANALYSIS_MODEL } from "./anthropic";
import { prisma } from "./prisma";
import { SIZE_LABELS, ENVIRONMENT_LABELS, type DogInput } from "./dogSchema";

const analysisSchema = z.object({
  matchedBreedSlugs: z.array(z.string()).max(3),
  trainingSummary: z.string().min(20).max(700),
});

export type MixedBreedAnalysis = z.infer<typeof analysisSchema>;

// Signature combinant les deux champs qui déclenchent une ré-analyse :
// si l'un ou l'autre change, l'ancienne analyse IA n'est plus valable.
export function mixedBreedAnalysisKey(mixedBreedNote: string, characteristics?: string | null): string {
  return `${mixedBreedNote}||${characteristics ?? ""}`;
}

interface AnalyzeInput {
  mixedBreedNote: string;
  characteristics?: string | null;
  weightKg: number;
  ageMonths: number;
  size: DogInput["size"];
  environment: DogInput["environment"];
}

// Demande à Claude d'identifier, parmi les races déjà connues du site,
// celles qui se rapprochent le plus des races dominantes décrites par le
// client pour son chien croisé — pour réutiliser les exercices et marques
// de nourriture déjà associés à ces races — et de rédiger un résumé
// personnalisé du programme de dressage adapté à ce chien précis.
// Renvoie null (jamais ne throw) si l'IA n'est pas configurée ou échoue :
// l'enregistrement du chien ne doit jamais dépendre de cette étape.
export async function analyzeMixedBreedDog(input: AnalyzeInput): Promise<MixedBreedAnalysis | null> {
  const anthropic = getAnthropicClient();
  if (!anthropic) return null;

  const breeds = await prisma.breed.findMany({
    where: { slug: { not: "croise" } },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
  const breedList = breeds.map((b) => `${b.slug} (${b.name})`).join(", ");

  const prompt = `Un client a enregistré un chien croisé (ou d'une race non répertoriée) sur Clebo, un site de dressage canin. Voici ce qu'il a décrit comme races dominantes : "${input.mixedBreedNote}".
${input.characteristics ? `\nCaractéristiques particulières décrites par le client : "${input.characteristics}".\n` : ""}
Profil du chien : poids ${input.weightKg} kg, âge ${input.ageMonths} mois, gabarit ${SIZE_LABELS[input.size]}, environnement de vie : ${ENVIRONMENT_LABELS[input.environment]}.

Races déjà connues du site (utilise UNIQUEMENT ces slugs exacts, jamais un autre) : ${breedList}.

1. Identifie 0 à 3 slugs parmi cette liste qui correspondent le mieux aux races dominantes décrites (vide si aucune ne correspond raisonnablement).
2. Rédige un résumé en français (4 à 6 phrases) du programme de dressage à privilégier pour CE chien précis, en tenant compte du tempérament probable du mélange, des caractéristiques éventuellement décrites, de son gabarit, de son âge et de son environnement de vie.`;

  try {
    const message = await anthropic.messages.create({
      model: MIXED_BREED_ANALYSIS_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          name: "fournir_analyse",
          description: "Fournit l'analyse structurée du chien croisé.",
          input_schema: {
            type: "object",
            properties: {
              matchedBreedSlugs: {
                type: "array",
                items: { type: "string" },
                maxItems: 3,
                description: "Slugs exacts des races du site les plus proches (peut être vide).",
              },
              trainingSummary: {
                type: "string",
                description: "Résumé en français du programme de dressage personnalisé.",
              },
            },
            required: ["matchedBreedSlugs", "trainingSummary"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "fournir_analyse" },
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) return null;

    const parsed = analysisSchema.safeParse(toolUse.input);
    if (!parsed.success) return null;

    const validSlugs = new Set(breeds.map((b) => b.slug));
    return {
      matchedBreedSlugs: parsed.data.matchedBreedSlugs.filter((slug) => validSlugs.has(slug)),
      trainingSummary: parsed.data.trainingSummary,
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse IA du chien croisé:", error);
    return null;
  }
}
