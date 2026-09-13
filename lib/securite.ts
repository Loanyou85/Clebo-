/**
 * Clebo ne traite aucun cas d'agressivité, de morsure ou de réactivité
 * envers les chiens ou les humains : ces situations demandent un
 * comportementaliste en présentiel, et un mauvais conseil à distance peut
 * mener à une morsure. Dès qu'un de ces mots apparaît dans le diagnostic,
 * le visiteur sort du tunnel de vente (voir /diagnostic/securite).
 *
 * La détection est volontairement large : un faux positif renvoie
 * quelqu'un vers un professionnel, un faux négatif le laisse acheter un
 * programme inadapté à un problème dangereux. Le déséquilibre est assumé.
 */
const MOTS_SENSIBLES = [
  "agress",
  "mord",
  "morsure",
  "morde",
  "attaque",
  "attaqu",
  "grogne",
  "grognement",
  "reactif",
  "réactif",
  "reactivite",
  "réactivité",
  "pince",
  "pincement",
  "menace",
  "dangereux",
  "bagarre",
  "se bat",
];

function normaliser(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function contientSujetSensible(...valeurs: Array<string | null | undefined>): boolean {
  const texte = normaliser(valeurs.filter(Boolean).join(" "));
  return MOTS_SENSIBLES.some((mot) => texte.includes(normaliser(mot)));
}
