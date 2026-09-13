import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur un programme, un remboursement ou ton compte : voici comment nous joindre.",
};

/*
  EMPLACEMENT À REMPLIR — coordonnées de contact.
  Remplace le bloc ci-dessous par une vraie adresse email relevée, et
  l'adresse postale de l'entreprise. La loi impose des coordonnées réelles
  et joignables pour vendre à des particuliers, et les demandes de
  remboursement arriveront par là.
*/
export default function ContactPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-8">Contact</h1>

      <div className="card-surface p-5 mb-10">
        <p className="text-sm text-encre-doux">
          À compléter : adresse email de contact (réelle et relevée) et adresse postale.
        </p>
      </div>

      <h2 className="titre text-titre-s mb-3">Demander un remboursement</h2>
      <p className="prose-clebo text-encre-doux mb-8">
        Écris-nous dans les 30 jours suivant ton achat, sans avoir à te justifier. Le remboursement
        est effectué sur le moyen de paiement d&apos;origine.
      </p>

      <h2 className="titre text-titre-s mb-3">Résilier le Suivi Clebo</h2>
      <p className="prose-clebo text-encre-doux mb-8">
        La résiliation se fait en un clic depuis ton espace, sans passer par nous, et sans préavis.
      </p>

      <h2 className="titre text-titre-s mb-3">Ton chien grogne, pince ou mord</h2>
      <p className="prose-clebo text-encre-doux">
        Ces situations ne se traitent pas par email et ne relèvent pas de Clebo.{" "}
        <Link href="/diagnostic/securite" className="text-signal-texte font-semibold">
          Voici ce qu&apos;il faut faire
        </Link>
        .
      </p>
    </div>
  );
}
