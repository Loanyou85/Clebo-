"use client";

/**
 * Maquette de téléphone dessinée en CSS/SVG. Son écran ne contient pas une
 * image mais du vrai contenu du produit (la séance du jour) : c'est
 * l'argument du hero, montrer ce qu'on achète.
 */
export default function Telephone({
  className = "",
  rotation = 0,
  children,
}: {
  className?: string;
  rotation?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={className} style={{ transform: `rotate(${rotation}deg)` }} aria-hidden>
      <div className="w-[220px] rounded-[28px] border border-bordure bg-surface p-2">
        <div className="rounded-[22px] bg-surface-2 overflow-hidden">
          <div className="flex justify-center pt-2 pb-1">
            <span className="block h-1 w-12 rounded-full bg-bordure" />
          </div>
          <div className="px-3 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
