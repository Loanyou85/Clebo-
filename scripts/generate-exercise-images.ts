// Génère une illustration placeholder (SVG) par exercice dans
// public/exercises/ : un chiot dessiné dans la posture exacte de
// l'exercice (assis, couché, en train de courir au rappel, en laisse...),
// pas juste une icône générique par niveau — pour que chaque module de
// dressage soit immédiatement reconnaissable visuellement.
import { writeFileSync, mkdirSync } from "fs";
import { join, basename } from "path";
import { BASE_EXERCISES } from "../prisma/data/exercises";

const OUT_DIR = join(process.cwd(), "public", "exercises");
mkdirSync(OUT_DIR, { recursive: true });

const BG = "#fff0e0";
const BODY = "#f97316";
const DARK = "#c2570a";
const MUZZLE = "#ffd9ad";
const NOSE = "#3a2417";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function frame(title: string, inner: string): string {
  const safeTitle = escapeXml(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260" role="img" aria-label="Illustration ${safeTitle}">
  <rect width="400" height="260" fill="${BG}"/>
  ${inner}
  <text x="200" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="${DARK}">${safeTitle}</text>
</svg>`;
}

// Tête + oreille tombante + museau + oeil, chien tourné vers la gauche.
// scale/rotation permettent de réutiliser le même dessin dans chaque pose.
function head(cx: number, cy: number, scale = 1, rotate = 0, tongue = false): string {
  return `<g transform="translate(${cx},${cy}) rotate(${rotate}) scale(${scale})">
    <ellipse cx="0" cy="0" rx="38" ry="33" fill="${BODY}"/>
    <path d="M 10 -28 C 40 -30 50 0 26 26 C 16 32 4 16 10 -6 Z" fill="${DARK}"/>
    <ellipse cx="-30" cy="12" rx="18" ry="13" fill="${MUZZLE}"/>
    <ellipse cx="-43" cy="10" rx="5.5" ry="4.5" fill="${NOSE}"/>
    ${tongue ? `<path d="M -22 22 Q -20 38 -8 34 Q -14 24 -14 20 Z" fill="#fb7185"/>` : `<path d="M -30 20 Q -28 26 -20 23" stroke="${NOSE}" stroke-width="3" stroke-linecap="round" fill="none"/>`}
    <circle cx="-8" cy="-6" r="4.5" fill="${NOSE}"/>
    <circle cx="-9" cy="-7.3" r="1.4" fill="#fff"/>
  </g>`;
}

function groundShadow(cx: number, cy: number, rx: number): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="9" fill="${DARK}" opacity="0.12"/>`;
}

const EXERCISE_SCENES: Record<string, string> = {
  "assis.svg": frame(
    "Assis",
    `<g transform="translate(190,140)">
      ${groundShadow(0, 88, 85)}
      <path d="M 62 20 Q 100 10 95 -30" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M 40 45 Q 70 40 68 75 Q 66 88 50 88" fill="#e8660f"/>
      <ellipse cx="10" cy="40" rx="52" ry="46" fill="${BODY}"/>
      <path d="M -35 55 Q -40 75 -38 88" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M -15 60 Q -18 78 -16 88" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      ${head(-45, -25)}
    </g>`
  ),

  "couche.svg": frame(
    "Couché",
    `<g transform="translate(200,150)">
      ${groundShadow(0, 55, 110)}
      <path d="M -30 35 L -80 42" stroke="${DARK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M -20 42 L -70 50" stroke="${DARK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M 55 15 Q 95 5 100 -20" stroke="${DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
      <ellipse cx="10" cy="28" rx="65" ry="30" fill="${BODY}"/>
      ${head(-55, 0, 0.9)}
    </g>`
  ),

  "rappel.svg": frame(
    "Rappel",
    `<g transform="translate(210,150)">
      ${groundShadow(0, 60, 100)}
      <path d="M 70 -30 L 100 -34" stroke="${DARK}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
      <path d="M 78 -10 L 112 -12" stroke="${DARK}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
      <path d="M 75 10 L 108 10" stroke="${DARK}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
      <path d="M 45 -5 Q 80 -35 65 -55" stroke="${DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M -25 30 Q -15 45 -40 55" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M 25 20 Q 40 38 20 52" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M -30 15 Q -55 20 -70 5" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M 10 5 Q 35 -5 45 -20" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <ellipse cx="0" cy="10" rx="58" ry="34" fill="${BODY}" transform="rotate(-8)"/>
      ${head(-55, -18, 1, -6, true)}
    </g>`
  ),

  "laisse.svg": frame(
    "Marche en laisse",
    `<g transform="translate(115,150)">
      ${groundShadow(80, 60, 110)}
      <rect x="195" y="-90" width="26" height="110" rx="10" fill="#3a2417"/>
      <ellipse cx="208" cy="28" rx="22" ry="12" fill="#1f1611"/>
      <path d="M 40 -30 Q 120 10 197 -70" stroke="${DARK}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M 55 5 Q 85 -5 80 -30" stroke="${DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M -25 35 L -35 58" stroke="${DARK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M 0 40 L 4 58" stroke="${DARK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M -35 15 L -55 40" stroke="${DARK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M 15 20 L 28 42" stroke="${DARK}" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="0" cy="10" rx="48" ry="30" fill="${BODY}"/>
      <ellipse cx="-38" cy="-8" rx="7" ry="8" fill="${DARK}"/>
      ${head(-45, -22, 0.86)}
    </g>`
  ),

  "proprete.svg": frame(
    "Propreté",
    `<g transform="translate(200,145)">
      ${groundShadow(0, 90, 120)}
      <!-- porte ouverte sur l'exterieur -->
      <rect x="-150" y="-95" width="90" height="150" rx="6" fill="#ffe3c2" stroke="${DARK}" stroke-width="4"/>
      <circle cx="-72" cy="-15" r="5" fill="${DARK}"/>
      <!-- touffes d'herbe -->
      <path d="M 60 85 Q 65 55 72 85 Q 78 60 85 85 Q 92 58 98 85 Z" fill="#4d9a3a"/>
      <path d="M 100 90 Q 106 65 112 90 Q 118 68 125 90 Z" fill="#4d9a3a"/>
      <!-- chiot assis, content -->
      <g transform="translate(30,0)">
        <path d="M 55 15 Q 90 5 82 -30" stroke="${DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>
        <path d="M 35 40 Q 60 35 58 65 Q 56 78 42 78" fill="#e8660f"/>
        <ellipse cx="8" cy="35" rx="45" ry="40" fill="${BODY}"/>
        <path d="M -28 48 Q -32 65 -30 78" stroke="${DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>
        <path d="M -10 52 Q -12 67 -10 78" stroke="${DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>
        ${head(-38, -20, 0.85)}
      </g>
    </g>`
  ),

  "socialisation.svg": frame(
    "Socialisation",
    `<g transform="translate(200,150)">
      ${groundShadow(0, 62, 140)}
      <!-- chien 1 (gauche), fait face a droite -->
      <g transform="translate(-70,0) scale(-1,1)">
        <path d="M 40 20 Q 70 12 62 -20" stroke="${DARK}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M -22 40 L -26 60" stroke="${DARK}" stroke-width="12" stroke-linecap="round"/>
        <path d="M 0 42 L 2 60" stroke="${DARK}" stroke-width="12" stroke-linecap="round"/>
        <ellipse cx="5" cy="18" rx="40" ry="34" fill="${BODY}"/>
        ${head(-38, -8, 0.78)}
      </g>
      <!-- chien 2 (droite), fait face a gauche -->
      <g transform="translate(70,0)">
        <path d="M 40 20 Q 70 12 62 -20" stroke="${DARK}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M -22 40 L -26 60" stroke="${DARK}" stroke-width="12" stroke-linecap="round"/>
        <path d="M 0 42 L 2 60" stroke="${DARK}" stroke-width="12" stroke-linecap="round"/>
        <ellipse cx="5" cy="18" rx="40" ry="34" fill="${BODY}"/>
        ${head(-38, -8, 0.78)}
      </g>
    </g>`
  ),

  "reste.svg": frame(
    "Reste / Pas bouger",
    `<g transform="translate(160,140)">
      ${groundShadow(0, 88, 85)}
      <path d="M 62 20 Q 100 10 95 -30" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M 40 45 Q 70 40 68 75 Q 66 88 50 88" fill="#e8660f"/>
      <ellipse cx="10" cy="40" rx="52" ry="46" fill="${BODY}"/>
      <path d="M -35 55 Q -40 75 -38 88" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M -15 60 Q -18 78 -16 88" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      ${head(-45, -25)}
    </g>
    <!-- main levee, signal "stop" -->
    <g transform="translate(285,110)">
      <path d="M -18 40 L -18 -10 Q -18 -20 -10 -20 Q -2 -20 -2 -10 L -2 -22 Q -2 -32 6 -32 Q 14 -32 14 -22 L 14 -12 Q 14 -22 22 -22 Q 30 -22 30 -12 L 30 20 Q 30 40 12 46 L -6 46 Q -18 46 -18 34 Z" fill="${MUZZLE}" stroke="${DARK}" stroke-width="3"/>
    </g>`
  ),

  "rappel-avance.svg": frame(
    "Rappel avancé",
    `<g transform="translate(210,150)">
      ${groundShadow(0, 60, 100)}
      <path d="M 70 -30 L 100 -34" stroke="${DARK}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
      <path d="M 78 -10 L 112 -12" stroke="${DARK}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
      <path d="M 75 10 L 108 10" stroke="${DARK}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
      <path d="M 45 -5 Q 80 -35 65 -55" stroke="${DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M -25 30 Q -15 45 -40 55" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M 25 20 Q 40 38 20 52" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M -30 15 Q -55 20 -70 5" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <path d="M 10 5 Q 35 -5 45 -20" stroke="${DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <ellipse cx="0" cy="10" rx="58" ry="34" fill="${BODY}" transform="rotate(-8)"/>
      ${head(-55, -18, 1, -6, true)}
      <!-- longe qui traine -->
      <path d="M -95 5 Q -130 30 -150 20" stroke="${DARK}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.7"/>
      <!-- distraction ignoree (papillon) -->
      <g transform="translate(120,-70)">
        <ellipse cx="-6" cy="-4" rx="9" ry="6" fill="#fbbf24"/>
        <ellipse cx="6" cy="-4" rx="9" ry="6" fill="#fbbf24"/>
        <ellipse cx="-5" cy="6" rx="7" ry="5" fill="#fbbf24"/>
        <ellipse cx="5" cy="6" rx="7" ry="5" fill="#fbbf24"/>
        <rect x="-1.5" y="-8" width="3" height="16" rx="1.5" fill="${NOSE}"/>
      </g>
    </g>`
  ),

  "sociabilisation.svg": frame(
    "Sociabilisation",
    `<g transform="translate(150,150)">
      ${groundShadow(50, 78, 130)}
      <!-- chiot assis -->
      <path d="M 42 15 Q 72 8 65 -22" stroke="${DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M 25 38 Q 48 33 46 60 Q 44 72 32 72" fill="#e8660f"/>
      <ellipse cx="5" cy="32" rx="46" ry="40" fill="${BODY}"/>
      <path d="M -22 45 Q -26 60 -24 72" stroke="${DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M -6 48 Q -8 62 -6 72" stroke="${DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>
      ${head(-32, -14, 0.85)}
      <!-- enfant qui caresse -->
      <g transform="translate(150,-40)">
        <circle cx="0" cy="0" r="26" fill="#ffd9ad"/>
        <path d="M -30 40 Q 0 15 30 40 L 26 90 L -26 90 Z" fill="#38bdf8"/>
        <circle cx="-9" cy="-4" r="3" fill="${NOSE}"/>
        <circle cx="9" cy="-4" r="3" fill="${NOSE}"/>
        <path d="M -8 8 Q 0 14 8 8" stroke="${NOSE}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- bras tendu vers le chien -->
        <path d="M -28 55 Q -70 55 -85 30" stroke="#ffd9ad" stroke-width="14" stroke-linecap="round" fill="none"/>
      </g>
    </g>`
  ),

  "troupeau.svg": frame(
    "Instinct de troupeau",
    `<g transform="translate(190,155)">
      ${groundShadow(0, 75, 95)}
      <!-- balle -->
      <circle cx="70" cy="-70" r="22" fill="#facc15"/>
      <path d="M 52 -70 Q 70 -85 88 -70" stroke="${DARK}" stroke-width="3" fill="none"/>
      <path d="M 52 -62 Q 70 -50 88 -62" stroke="${DARK}" stroke-width="3" fill="none"/>
      <!-- chiot qui saute -->
      <g transform="rotate(-18)">
        <path d="M 40 10 Q 70 0 62 -30" stroke="${DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M -30 20 Q -50 10 -55 -12" stroke="${DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M -15 25 Q -30 40 -50 38" stroke="${DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M 15 22 Q 25 40 45 42" stroke="${DARK}" stroke-width="14" stroke-linecap="round" fill="none"/>
        <ellipse cx="0" cy="0" rx="52" ry="32" fill="${BODY}"/>
        ${head(-48, -20, 0.95, -10)}
      </g>
    </g>`
  ),
};

for (const exercise of BASE_EXERCISES) {
  if (!exercise.imageUrl) continue;
  const filename = basename(exercise.imageUrl);
  const scene = EXERCISE_SCENES[filename];
  if (!scene) {
    console.warn(`Pas d'illustration définie pour ${filename}, exercice ignoré.`);
    continue;
  }
  writeFileSync(join(OUT_DIR, filename), scene, "utf8");
}

console.log(`Généré ${Object.keys(EXERCISE_SCENES).length} illustrations dans public/exercises/`);
