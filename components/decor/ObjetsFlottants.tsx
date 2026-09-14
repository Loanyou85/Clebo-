"use client";

/**
 * Les objets qui gravitent autour du téléphone du hero : une friandise, un
 * clicker, une laisse, une médaille. Dessinés ici en SVG (dégradés + ombre
 * interne pour le relief) plutôt qu'importés : aucun fichier tiers, poids
 * négligeable, et ils suivent le thème clair/sombre comme le reste.
 *
 * Purement décoratifs : masqués au lecteur d'écran, et retirés sous 768px
 * par la classe `decor-desktop`.
 */

function Socle({
  children,
  className = "",
  delai = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delai?: number;
}) {
  return (
    <div className={`absolute flotte ${className}`} style={{ animationDelay: `${delai}s` }} aria-hidden>
      <div className="panneau p-3 shadow-none">{children}</div>
    </div>
  );
}

export function Friandise({ className = "", delai = 0 }: { className?: string; delai?: number }) {
  return (
    <Socle className={className} delai={delai}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <defs>
          <linearGradient id="grad-friandise" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ambre)" />
            <stop offset="100%" stopColor="var(--signal-sombre)" />
          </linearGradient>
        </defs>
        <path
          d="M8 12c0-2 1.6-3.6 3.6-3.6h10.8C24.4 8.4 26 10 26 12v10c0 2-1.6 3.6-3.6 3.6H11.6C9.6 25.6 8 24 8 22z"
          fill="url(#grad-friandise)"
        />
        <path d="M8 15h18M8 19h18" stroke="var(--surface)" strokeOpacity="0.45" strokeWidth="1.5" />
      </svg>
    </Socle>
  );
}

export function Clicker({ className = "", delai = 0 }: { className?: string; delai?: number }) {
  return (
    <Socle className={className} delai={delai}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <rect x="6" y="11" width="22" height="14" rx="4" fill="var(--surface-2)" stroke="var(--bordure)" />
        <circle cx="17" cy="18" r="4" fill="var(--signal)" />
        <path d="M17 6v3M11 8l1.5 2.5M23 8l-1.5 2.5" stroke="var(--sourdine)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </Socle>
  );
}

export function Laisse({ className = "", delai = 0 }: { className?: string; delai?: number }) {
  return (
    <Socle className={className} delai={delai}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <path
          d="M9 25c0-7 5-9 8-9s8 2 8 9"
          stroke="var(--signal)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="9" cy="25" r="3" fill="var(--surface-2)" stroke="var(--bordure)" />
        <rect x="14" y="7" width="6" height="5" rx="2" fill="var(--sourdine)" />
      </svg>
    </Socle>
  );
}

export function Medaille({ className = "", delai = 0 }: { className?: string; delai?: number }) {
  return (
    <Socle className={className} delai={delai}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <defs>
          <linearGradient id="grad-medaille" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ambre)" />
            <stop offset="100%" stopColor="var(--signal)" />
          </linearGradient>
        </defs>
        <path d="M11 5h4l3 7h-10z" fill="var(--sourdine)" />
        <path d="M23 5h-4l-3 7h10z" fill="var(--bordure)" />
        <circle cx="17" cy="21" r="8" fill="url(#grad-medaille)" />
        <path
          d="M14 21.5l2 2 4-4.5"
          stroke="var(--sur-signal)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </Socle>
  );
}
