interface Point {
  dayNumber: number;
  successes: number;
}

/**
 * La courbe de progression, en SVG inline : voir 5/10 en semaine 1 puis
 * 9/10 en semaine 3 est ce qui fait tenir quand la motivation baisse.
 * Rendue côté serveur, sans librairie de graphiques.
 */
export default function ProgressChart({ points }: { points: Point[] }) {
  if (points.length === 0) {
    return (
      <p className="text-sm text-encre-doux">
        Ta courbe apparaît ici dès la première séance validée.
      </p>
    );
  }

  const largeur = 320;
  const hauteur = 120;
  const marge = 8;
  const maxJour = Math.max(...points.map((p) => p.dayNumber), 2);

  const coordonnees = points.map((point) => {
    const x = marge + ((point.dayNumber - 1) / Math.max(1, maxJour - 1)) * (largeur - marge * 2);
    const y = hauteur - marge - (point.successes / 10) * (hauteur - marge * 2);
    return { x, y, ...point };
  });

  const chemin = coordonnees.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const premier = points[0];
  const dernier = points[points.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${largeur} ${hauteur}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Progression : ${premier.successes} sur 10 au jour ${premier.dayNumber}, ${dernier.successes} sur 10 au jour ${dernier.dayNumber}.`}
      >
        <line
          x1={marge}
          y1={hauteur - marge}
          x2={largeur - marge}
          y2={hauteur - marge}
          stroke="var(--brume)"
          strokeWidth="1"
        />
        <path d={chemin} fill="none" stroke="var(--signal)" strokeWidth="2.5" strokeLinejoin="round" />
        {coordonnees.map((c) => (
          <circle key={c.dayNumber} cx={c.x} cy={c.y} r="3" fill="var(--signal)" />
        ))}
      </svg>

      <p className="text-sm text-encre-doux mt-2">
        {points.length === 1
          ? `${premier.successes}/10 au jour ${premier.dayNumber}.`
          : `De ${premier.successes}/10 au jour ${premier.dayNumber} à ${dernier.successes}/10 au jour ${dernier.dayNumber}.`}
      </p>
    </div>
  );
}
