// Génère une illustration placeholder (SVG) par exercice dans
// public/exercises/, à partir du champ imageUrl de chaque exercice. Un
// pictogramme distinct par niveau de dressage (obéissance, laisse,
// rappel, propreté, socialisation) donne un repère visuel immédiat.
import { writeFileSync, mkdirSync } from "fs";
import { join, basename } from "path";
import { BASE_EXERCISES } from "../prisma/data/exercises";
import type { ExerciseLevel } from "@prisma/client";

const OUT_DIR = join(process.cwd(), "public", "exercises");
mkdirSync(OUT_DIR, { recursive: true });

const LEVEL_STYLE: Record<ExerciseLevel, { hue: number; icon: string }> = {
  OBEISSANCE_BASE: {
    hue: 30,
    icon: `<circle cx="0" cy="-6" r="30" fill="none" stroke="currentColor" stroke-width="7"/><path d="M -14 -6 L -4 6 L 18 -18" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  LAISSE: {
    hue: 15,
    icon: `<path d="M -40 20 Q 0 -30 40 20" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="-40" cy="20" r="6" fill="currentColor"/><circle cx="40" cy="20" r="6" fill="currentColor"/>`,
  },
  RAPPEL: {
    hue: 45,
    icon: `<path d="M -35 0 L 25 0 M 25 0 L 10 -14 M 25 0 L 10 14" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  PROPRETE: {
    hue: 200,
    icon: `<path d="M 0 -30 L 32 -2 L 24 -2 L 24 26 L -24 26 L -24 -2 L -32 -2 Z" fill="currentColor"/>`,
  },
  SOCIALISATION: {
    hue: 320,
    icon: `<circle cx="-16" cy="0" r="20" fill="currentColor" opacity="0.85"/><circle cx="20" cy="0" r="20" fill="currentColor" opacity="0.55"/>`,
  },
};

function svgFor(title: string, level: ExerciseLevel): string {
  const style = LEVEL_STYLE[level];
  const light = `hsl(${style.hue}, 75%, 93%)`;
  const dark = `hsl(${style.hue}, 55%, 36%)`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" role="img" aria-label="Illustration exercice ${title}">
  <rect width="400" height="260" fill="${light}"/>
  <g transform="translate(200,110)" color="${dark}">
    ${style.icon}
  </g>
  <text x="200" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="${dark}">${title}</text>
</svg>`;
}

for (const exercise of BASE_EXERCISES) {
  if (!exercise.imageUrl) continue;
  const filename = basename(exercise.imageUrl);
  const svg = svgFor(exercise.title, exercise.level);
  writeFileSync(join(OUT_DIR, filename), svg, "utf8");
}

console.log(`Généré ${BASE_EXERCISES.length} illustrations dans public/exercises/`);
