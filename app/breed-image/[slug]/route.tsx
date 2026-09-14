import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

// Illustration placeholder générée à la volée (jamais écrite sur disque,
// ce qui ne fonctionnerait pas de façon fiable sur un hébergeur
// serverless) pour les races créées par un client sans photo réelle —
// même principe que app/icon.tsx, appliqué à une route dynamique par race.
export const runtime = "nodejs";

function hueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const breed = await prisma.breed.findUnique({ where: { slug }, select: { name: true } });
  const name = breed?.name ?? slug;
  const hue = hueFromName(name);
  const light = `hsl(${hue}, 70%, 92%)`;
  const dark = `hsl(${hue}, 45%, 38%)`;
  const initiale = (name.trim()[0] ?? "?").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: light,
          fontFamily: "sans-serif",
        }}
      >
        {/* L'initiale de la race, pas un emoji : next/og ne dessine pas
            les emoji, il télécharge l'image Twemoji correspondante — 🐾 y
            est une patte gris très foncé, et si la requête échoue il ne
            reste rien du tout. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: dark,
            color: light,
            fontSize: 76,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          {initiale}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: dark, textAlign: "center", padding: "0 40px" }}>
          {name}
        </div>
      </div>
    ),
    { width: 800, height: 600 }
  );
}
