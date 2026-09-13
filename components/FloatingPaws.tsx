// Décor animé permanent en arrière-plan : des empreintes de patte qui
// remontent en diagonale, en boucle infinie, jamais cliquables.
// Positions/délais fixes (pas de Math.random au rendu) pour que le rendu
// serveur et client soient identiques et éviter tout warning d'hydratation.
const PAWS = [
  { left: "4%", size: 26, delay: "0s", duration: "14s", drift: "10vw", opacity: 0.5 },
  { left: "12%", size: 18, delay: "3s", duration: "11s", drift: "6vw", opacity: 0.35 },
  { left: "20%", size: 32, delay: "7s", duration: "17s", drift: "14vw", opacity: 0.45 },
  { left: "29%", size: 20, delay: "1.5s", duration: "13s", drift: "8vw", opacity: 0.3 },
  { left: "38%", size: 28, delay: "9s", duration: "15s", drift: "-8vw", opacity: 0.4 },
  { left: "47%", size: 22, delay: "4.5s", duration: "12s", drift: "11vw", opacity: 0.35 },
  { left: "55%", size: 30, delay: "11s", duration: "16s", drift: "-10vw", opacity: 0.5 },
  { left: "63%", size: 18, delay: "2s", duration: "13s", drift: "7vw", opacity: 0.3 },
  { left: "71%", size: 26, delay: "6s", duration: "14s", drift: "-12vw", opacity: 0.4 },
  { left: "80%", size: 20, delay: "13s", duration: "11s", drift: "9vw", opacity: 0.3 },
  { left: "88%", size: 30, delay: "8.5s", duration: "18s", drift: "-9vw", opacity: 0.45 },
  { left: "94%", size: 22, delay: "5s", duration: "12.5s", drift: "6vw", opacity: 0.35 },
] as const;

function PawIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill={color}>
      <ellipse cx="50" cy="66" rx="26" ry="22" />
      <ellipse cx="18" cy="34" rx="12" ry="15" />
      <ellipse cx="42" cy="14" rx="12" ry="15" />
      <ellipse cx="68" cy="14" rx="12" ry="15" />
      <ellipse cx="88" cy="36" rx="12" ry="15" />
    </svg>
  );
}

export default function FloatingPaws() {
  return (
    <div className="floating-paws" aria-hidden="true">
      {PAWS.map((paw, i) => (
        <span
          key={i}
          className="floating-paw"
          style={
            {
              left: paw.left,
              width: paw.size,
              height: paw.size,
              animationDelay: paw.delay,
              animationDuration: paw.duration,
              "--drift": paw.drift,
              "--peak-opacity": paw.opacity,
            } as React.CSSProperties
          }
        >
          <PawIcon size={paw.size} color="#f97316" />
        </span>
      ))}
    </div>
  );
}
