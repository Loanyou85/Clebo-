/**
 * Bandeau défilant en boucle infinie. Le contenu est dupliqué et la piste
 * translatée de 0 à -50 % : la répétition est invisible, et l'animation
 * étant en CSS pur (transform), elle ne coûte rien au fil principal.
 * Pause au survol, arrêt complet si prefers-reduced-motion (globals.css).
 */
export default function Marquee({ items }: { items: string[] }) {
  const piste = [...items, ...items];

  return (
    <div className="marquee" aria-label={items.join(", ")}>
      <div className="marquee-piste">
        {piste.map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-3 whitespace-nowrap px-5 py-2 text-sm font-semibold text-sourdine"
            aria-hidden={index >= items.length}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
