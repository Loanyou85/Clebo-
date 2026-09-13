import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, AI_MODEL } from "./anthropic";

const profileSchema = z.object({
  displayName: z.string().min(1).max(80),
  description: z.string().min(40).max(600),
  temperament: z.string().min(20).max(400),
  weightMinKg: z.number().positive().max(120),
  weightMaxKg: z.number().positive().max(120),
  trainingGuide: z.string().min(100).max(3000),
});

export type BreedProfile = z.infer<typeof profileSchema>;

export class BreedGenerationUnavailableError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY n'est pas configurée : impossible de générer cette race automatiquement.");
    this.name = "BreedGenerationUnavailableError";
  }
}

// Génère le profil complet d'une race (ou d'un chien croisé décrit
// librement) qui n'existe pas encore dans le catalogue du site : description,
// tempérament, gabarit de poids adulte, et un guide de dressage complet
// adapté à cette race précise. Contrairement à l'analyse de mélange
// précédente, ceci CRÉE une entrée de race à part entière, réutilisable
// pour tous les futurs clients qui chercheront la même race.
export async function generateBreedProfile(rawName: string): Promise<BreedProfile> {
  const anthropic = getAnthropicClient();
  if (!anthropic) throw new BreedGenerationUnavailableError();

  const prompt = `Un client de Clebo (site de dressage canin en France) a cherché la race "${rawName}" dans le catalogue et elle n'existe pas encore. Crée sa fiche complète.

1. "displayName" : le nom propre et bien orthographié de cette race en français (ex: si le client a tapé "berger allemand", renvoie "Berger Allemand" ; si c'est un mélange décrit en langage courant type "labrador x border collie", renvoie un nom lisible tel quel, ex: "Croisé Labrador / Border Collie").
2. "description" : 3-4 phrases présentant la race (origine, usage historique, popularité).
3. "temperament" : 2-3 phrases sur le caractère typique de cette race.
4. "weightMinKg" et "weightMaxKg" : fourchette de poids adulte réaliste en kg.
5. "trainingGuide" : un guide de dressage COMPLET et actionnable en français (8 à 15 phrases ou une liste), spécifique à cette race — points de vigilance, ordre dans lequel travailler les exercices de base (assis, rappel, laisse, propreté, socialisation...), fréquence et durée typiques, pièges fréquents propres à cette race.`;

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: "fournir_fiche_race",
        description: "Fournit la fiche complète de la race.",
        input_schema: {
          type: "object",
          properties: {
            displayName: { type: "string" },
            description: { type: "string" },
            temperament: { type: "string" },
            weightMinKg: { type: "number" },
            weightMaxKg: { type: "number" },
            trainingGuide: { type: "string" },
          },
          required: ["displayName", "description", "temperament", "weightMinKg", "weightMaxKg", "trainingGuide"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "fournir_fiche_race" },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("L'IA n'a pas renvoyé de fiche exploitable pour cette race.");
  }

  return profileSchema.parse(toolUse.input);
}
