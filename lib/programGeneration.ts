import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, AI_MODEL } from "./anthropic";

const jourSchema = z.object({
  dayNumber: z.number().int().min(1).max(60),
  objective: z.string().min(15).max(200),
  instructions: z.string().min(80).max(1200),
  repetitions: z.number().int().min(1).max(30),
  durationMin: z.number().int().min(3).max(30),
  commonMistake: z.string().min(30).max(400),
  /** Index de l'exercice du programme auquel ce jour se rattache : sert à
   *  réutiliser la même vidéo sur tous les jours qui travaillent la même
   *  chose (voir scripts/generate-programs.ts). */
  exerciseIndex: z.number().int().min(0).max(9),
});

const lotSchema = z.object({ days: z.array(jourSchema).min(1) });

export type JourGenere = z.infer<typeof jourSchema>;

export class ProgramGenerationUnavailableError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY n'est pas configurée : impossible de générer les séances.");
    this.name = "ProgramGenerationUnavailableError";
  }
}

export interface ProgramContext {
  title: string;
  promise: string;
  summary: string;
  durationDays: number;
  exercises: string[];
}

/**
 * Génère un lot de séances datées. Le programme complet est découpé en
 * plusieurs appels : 30 séances détaillées d'un coup dépasseraient la
 * taille de réponse du modèle et perdraient en qualité sur la fin.
 */
export async function generateProgramDays(
  programme: ProgramContext,
  premierJour: number,
  dernierJour: number
): Promise<JourGenere[]> {
  const anthropic = getAnthropicClient();
  if (!anthropic) throw new ProgramGenerationUnavailableError();

  const listeExercices = programme.exercises.map((ex, i) => `${i}. ${ex}`).join("\n");

  const prompt = `Tu construis un programme de dressage canin français, vendu à des propriétaires débutants qui ne connaissent pas le vocabulaire d'éducateur.

Programme : "${programme.title}" (${programme.durationDays} jours)
Promesse faite au client : "${programme.promise}"
Contexte : ${programme.summary}

Exercices du programme, à travailler dans cet ordre de progression :
${listeExercices}

Génère les séances des jours ${premierJour} à ${dernierJour} inclus.

Règles impératives :
- Une seule séance par jour, de 5 à 15 minutes, faisable par quelqu'un qui n'a jamais dressé de chien.
- "objective" : l'objectif du jour en UNE phrase concrète et mesurable (ex : "Il tient 10 pas laisse détendue dans le couloir"), pas un thème vague.
- "instructions" : le déroulé pas à pas de la séance, au tutoiement, phrases courtes, verbes actifs. Décris ce que le propriétaire fait avec ses mains, sa voix et ses déplacements.
- "commonMistake" : l'erreur précise que font la plupart des gens CE JOUR-LÀ, et pourquoi elle annule le travail. Jamais une généralité.
- "exerciseIndex" : l'index (dans la liste ci-dessus) de l'exercice travaillé ce jour-là. La progression doit être graduelle : les premiers jours sur les premiers exercices, les derniers jours sur les derniers.
- La difficulté monte progressivement d'un jour à l'autre, avec des jours de consolidation.
- Renforcement positif uniquement : jamais de collier électrique, de collier étrangleur, de mise sur le dos ni de punition physique.
- Ne traite jamais l'agressivité, la morsure ou la réactivité : ces cas relèvent d'un comportementaliste en présentiel.`;

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: "fournir_seances",
        description: "Fournit les séances datées du programme.",
        input_schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dayNumber: { type: "number" },
                  objective: { type: "string" },
                  instructions: { type: "string" },
                  repetitions: { type: "number" },
                  durationMin: { type: "number" },
                  commonMistake: { type: "string" },
                  exerciseIndex: { type: "number" },
                },
                required: [
                  "dayNumber",
                  "objective",
                  "instructions",
                  "repetitions",
                  "durationMin",
                  "commonMistake",
                  "exerciseIndex",
                ],
              },
            },
          },
          required: ["days"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "fournir_seances" },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("L'IA n'a pas renvoyé de séances exploitables.");
  }

  return lotSchema.parse(toolUse.input).days;
}
