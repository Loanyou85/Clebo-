import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

// Client Anthropic paresseux : ne throw que si on essaie vraiment de s'en
// servir sans clé configurée (l'IA est une amélioration optionnelle, le
// reste du site doit fonctionner sans ANTHROPIC_API_KEY).
export function getAnthropicClient(): Anthropic | null {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client = new Anthropic({ apiKey });
  return client;
}

export const AI_MODEL = "claude-haiku-4-5-20251001";
