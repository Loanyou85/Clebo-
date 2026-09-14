import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agressivité : ce qu'il faut faire",
  description:
    "Les cas d'agressivité, de morsure ou de réactivité demandent un comportementaliste en présentiel. Clebo ne les traite pas à distance.",
  robots: { index: false },
};

/**
 * Sortie du tunnel de vente. Aucun bouton d'achat sur cette page, volontairement :
 * un mauvais conseil à distance sur un chien qui mord peut mener à une morsure.
 */
export default function SecuritePage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-5">Ce cas demande un professionnel en face à face</h1>

      <div className="prose-clebo text-sourdine flex flex-col gap-4 mb-10">
        <p>
          Un chien qui grogne, pince ou mord ne fait pas un caprice : il exprime une gêne, une peur
          ou une douleur que seule une observation directe permet de comprendre. Personne ne peut
          évaluer ça à travers un écran, nous y compris.
        </p>
        <p>
          C&apos;est pour ça que Clebo ne vend aucun programme sur ces situations. Te donner des
          exercices à distance ici serait au mieux inutile, au pire dangereux pour toi, pour ton
          entourage et pour ton chien.
        </p>
      </div>

      <h2 className="titre text-titre-s mb-4">Ce qu&apos;on te conseille de faire</h2>
      <ol className="flex flex-col gap-4 mb-10">
        <li className="card-surface p-5">
          <p className="font-semibold mb-1">1. Commence par le vétérinaire</p>
          <p className="text-sm text-sourdine">
            Une douleur, une otite ou un problème de vue expliquent une grande partie des
            changements de comportement soudains. C&apos;est toujours la première chose à écarter.
          </p>
        </li>
        <li className="card-surface p-5">
          <p className="font-semibold mb-1">2. Consulte un comportementaliste diplômé</p>
          <p className="text-sm text-sourdine">
            Cherche un vétérinaire comportementaliste, ou un éducateur certifié qui travaille en
            renforcement positif et se déplace chez toi. Compte 60 à 120 € la séance.
          </p>
        </li>
        <li className="card-surface p-5">
          <p className="font-semibold mb-1">3. En attendant, réduis les situations à risque</p>
          <p className="text-sm text-sourdine">
            Évite les contextes qui déclenchent les grognements plutôt que de les affronter, et ne
            punis jamais un grognement : c&apos;est l&apos;avertissement qui précède la morsure, un
            chien qui n&apos;ose plus grogner mord sans prévenir.
          </p>
        </li>
      </ol>

      <p className="text-sm text-sourdine mb-6 prose-clebo">
        Si le problème de ton chien est différent (laisse, rappel, propreté, solitude, sauts), tu
        peux refaire le diagnostic.
      </p>
      <Link href="/diagnostic" className="btn-outline">
        Refaire le diagnostic
      </Link>
    </div>
  );
}
