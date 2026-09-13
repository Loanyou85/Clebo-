export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function isYoutubeSearchConfigured(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

// Trouve une vraie vidéo YouTube pertinente via l'API officielle (clé API
// simple, pas d'OAuth) — utilisée en complément du lien de recherche
// (youtubeSearchUrl) pour intégrer directement une vidéo plutôt que de
// laisser le client chercher lui-même. Best-effort : renvoie null sans
// jamais faire échouer l'appelant (clé absente, quota dépassé, aucun
// résultat...).
export async function findYoutubeVideo(query: string): Promise<{ videoId: string; embedUrl: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "1",
      relevanceLanguage: "fr",
      safeSearch: "strict",
      key: apiKey,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    if (!res.ok) {
      console.error(`Recherche YouTube refusée (${res.status}).`);
      return null;
    }
    const json = (await res.json()) as { items?: Array<{ id?: { videoId?: string } }> };
    const videoId = json.items?.[0]?.id?.videoId;
    if (!videoId) return null;

    return { videoId, embedUrl: `https://www.youtube.com/embed/${videoId}` };
  } catch (error) {
    console.error("Erreur lors de la recherche YouTube:", error);
    return null;
  }
}
