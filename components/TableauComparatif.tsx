/**
 * Clebo / YouTube gratuit / Éducateur canin.
 *
 * C'est la section la plus persuasive du site : elle justifie les 59 € en
 * une image, en montrant que Clebo n'est pas « moins cher que YouTube »
 * (impossible, YouTube est gratuit) mais qu'il apporte précisément ce que
 * YouTube ne peut pas donner, à un dixième du prix d'un éducateur.
 *
 * Les mentions sur l'éducateur canin restent factuelles et honnêtes : il
 * fait mieux que Clebo sur plusieurs lignes, et le dire renforce la
 * crédibilité du reste.
 */

type Valeur = { etat: "oui" | "non" | "partiel"; texte: string };

const LIGNES: Array<{ critere: string; clebo: Valeur; youtube: Valeur; educateur: Valeur }> = [
  {
    critere: "Prix",
    clebo: { etat: "oui", texte: "59 € une fois" },
    youtube: { etat: "oui", texte: "Gratuit" },
    educateur: { etat: "non", texte: "50 à 80 € la séance" },
  },
  {
    critere: "Plan adapté à ton chien",
    clebo: { etat: "oui", texte: "Après 6 questions" },
    youtube: { etat: "non", texte: "Vidéos génériques" },
    educateur: { etat: "oui", texte: "Sur mesure" },
  },
  {
    critere: "Un ordre à suivre, jour par jour",
    clebo: { etat: "oui", texte: "30 jours datés" },
    youtube: { etat: "non", texte: "À toi de trier" },
    educateur: { etat: "partiel", texte: "Entre deux séances" },
  },
  {
    critere: "Suivi de progression",
    clebo: { etat: "oui", texte: "Journal et courbe" },
    youtube: { etat: "non", texte: "Aucun" },
    educateur: { etat: "partiel", texte: "De mémoire" },
  },
  {
    critere: "Disponible le soir, chez toi",
    clebo: { etat: "oui", texte: "Toujours" },
    youtube: { etat: "oui", texte: "Toujours" },
    educateur: { etat: "non", texte: "Sur rendez-vous" },
  },
  {
    critere: "Œil d'un professionnel en direct",
    clebo: { etat: "non", texte: "Pas encore" },
    youtube: { etat: "non", texte: "Aucun" },
    educateur: { etat: "oui", texte: "C'est sa force" },
  },
];

function Cellule({ valeur, accent }: { valeur: Valeur; accent?: boolean }) {
  const marque = valeur.etat === "oui" ? "✓" : valeur.etat === "non" ? "✕" : "~";
  const couleur =
    valeur.etat === "oui" ? "text-pousse" : valeur.etat === "non" ? "text-sourdine" : "text-ambre";

  return (
    <td className={`p-4 align-top ${accent ? "bg-surface-2" : ""}`}>
      <span className={`font-bold mr-2 ${couleur}`} aria-hidden>
        {marque}
      </span>
      <span className="text-sm">{valeur.texte}</span>
    </td>
  );
}

export default function TableauComparatif() {
  return (
    <div className="panneau overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-bordure">
            <th className="p-4 text-left text-sm font-semibold text-sourdine">&nbsp;</th>
            <th className="p-4 text-left bg-surface-2">
              <span className="titre text-lg">Clebo</span>
            </th>
            <th className="p-4 text-left text-sm font-semibold text-sourdine">YouTube gratuit</th>
            <th className="p-4 text-left text-sm font-semibold text-sourdine">Éducateur canin</th>
          </tr>
        </thead>
        <tbody>
          {LIGNES.map((ligne) => (
            <tr key={ligne.critere} className="border-b border-bordure last:border-0">
              <th scope="row" className="p-4 text-left text-sm font-semibold">
                {ligne.critere}
              </th>
              <Cellule valeur={ligne.clebo} accent />
              <Cellule valeur={ligne.youtube} />
              <Cellule valeur={ligne.educateur} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
