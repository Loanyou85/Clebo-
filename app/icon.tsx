import { ImageResponse } from "next/og";

/**
 * Icône Clebo : le monogramme du logotype sur le rond orange de la marque.
 *
 * Pas d'emoji ici : `next/og` ne dessine pas les emoji lui-même, il va
 * chercher l'image correspondante chez Twemoji, où 🐾 est une patte gris
 * très foncé. Résultat dans l'onglet : une tache noire juste avant le mot
 * « Clebo ». Une lettre est rendue avec la police embarquée, donc
 * identique partout et lisible à 16 px.
 *
 * L'encre sur l'orange (6,3:1) et non le blanc (2,8:1) : même règle de
 * contraste que les boutons.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#f97316",
          color: "#1c1917",
          fontSize: 26,
          fontWeight: 700,
          // Le tracé du C occupe le haut de sa ligne : centré à la
          // lettre près, il flotte 1,5 px au-dessus du centre du rond.
          // Mesuré sur le PNG rendu, pas estimé à l'œil.
          paddingTop: 3,
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
