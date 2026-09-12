// Génère une illustration placeholder (SVG) par race dans public/breeds/.
// Silhouette de chien simple + teinte propre à chaque race, pour que
// chaque fiche race ait sa propre image dès le MVP sans dépendre d'une
// banque de vraies photos. À remplacer par de vraies photos plus tard en
// gardant le même chemin de fichier (public/breeds/<slug>.svg).
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { BREEDS } from "../prisma/data/breeds";

const OUT_DIR = join(process.cwd(), "public", "breeds");
mkdirSync(OUT_DIR, { recursive: true });

function svgFor(name: string, hue: number): string {
  const light = `hsl(${hue}, 70%, 92%)`;
  const mid = `hsl(${hue}, 55%, 72%)`;
  const dark = `hsl(${hue}, 45%, 38%)`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="Illustration ${name}">
  <rect width="400" height="300" fill="${light}"/>
  <g transform="translate(200,165)">
    <ellipse cx="0" cy="70" rx="120" ry="14" fill="${dark}" opacity="0.15"/>
    <path d="M -70 -40 Q -95 -95 -55 -80 Q -50 -50 -35 -35 Z" fill="${mid}"/>
    <path d="M 70 -40 Q 95 -95 55 -80 Q 50 -50 35 -35 Z" fill="${mid}"/>
    <circle cx="0" cy="0" r="78" fill="${mid}"/>
    <ellipse cx="0" cy="28" rx="42" ry="34" fill="${light}"/>
    <circle cx="-26" cy="-18" r="9" fill="${dark}"/>
    <circle cx="26" cy="-18" r="9" fill="${dark}"/>
    <ellipse cx="0" cy="18" rx="13" ry="9" fill="${dark}"/>
    <path d="M 0 24 Q -14 40 -26 34" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M 0 24 Q 14 40 26 34" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
  <text x="200" y="272" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="${dark}">${name}</text>
</svg>`;
}

for (const breed of BREEDS) {
  const svg = svgFor(breed.name, breed.hue);
  writeFileSync(join(OUT_DIR, `${breed.slug}.svg`), svg, "utf8");
}

console.log(`Généré ${BREEDS.length} illustrations dans public/breeds/`);
