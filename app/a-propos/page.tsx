import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qui est derrière Clebo",
  description: "L'histoire et la méthode derrière Clebo, et ce que Clebo ne fait délibérément pas.",
};

/*
  EMPLACEMENT À REMPLIR — fondateur.
  Remplace le bloc « Qui je suis » ci-dessous par ta vraie histoire, en
  gardant le ton direct : qui tu es, quel chien t'a amené là, ce que tu as
  raté au début. Ajoute ta photo dans /public/fondateur.jpg puis affiche-la
  avec next/image à la place du cadre gris.
  Pour un produit payant, cette page fait une grosse partie de la confiance :
  une page « à propos » vide vaut mieux qu'une page inventée, mais une page
  vraie vaut infiniment mieux que les deux.
*/
export default function AProposPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-8">Qui est derrière Clebo</h1>

      <div className="card-surface p-6 mb-10">
        <div className="h-40 w-40 rounded-[20px] bg-surface-2 mb-5" aria-hidden />
        <p className="font-semibold mb-2">Ta photo et ton histoire viennent ici.</p>
        <p className="text-sm text-sourdine prose-clebo">
          Cet emplacement est volontairement vide : on préfère ne rien raconter plutôt
          qu&apos;inventer un fondateur ou une expérience qui n&apos;existe pas.
        </p>
      </div>

      <h2 className="titre text-titre-s mb-3">Ce que Clebo fait</h2>
      <p className="prose-clebo text-sourdine mb-8">
        Clebo ne vend pas de l&apos;information : elle est déjà gratuite et partout. Clebo vend un
        cadre. Un programme daté que tu ne peux pas sauter, une seule chose à faire par jour, et une
        mesure de la progression de ton chien pour que tu saches si ça avance vraiment.
      </p>

      <h2 className="titre text-titre-s mb-3">Ce que Clebo ne fait pas</h2>
      <p className="prose-clebo text-sourdine mb-4">
        Clebo ne traite aucun cas d&apos;agressivité, de morsure ou de réactivité envers les chiens
        ou les humains. Ces situations demandent l&apos;œil d&apos;un professionnel en présentiel, et
        un mauvais conseil donné à distance peut mener à une morsure.
      </p>
      <p className="prose-clebo text-sourdine mb-8">
        Clebo ne promet pas non plus de résultat garanti : la plupart des chiens progressent
        nettement en trois semaines de travail régulier, mais aucun professionnel honnête ne peut
        garantir le comportement d&apos;un animal.
      </p>

      <h2 className="titre text-titre-s mb-3">La méthode</h2>
      <p className="prose-clebo text-sourdine mb-8">
        Renforcement positif uniquement : on récompense ce qu&apos;on veut voir se répéter, on ne
        punit pas ce qu&apos;on ne veut plus. Pas de collier électrique, pas de collier étrangleur,
        pas de mise sur le dos. Ces méthodes donnent parfois un résultat rapide et abîment la
        relation durablement.
      </p>

      <Link href="/diagnostic" className="btn-primary">
        Commencer le diagnostic
      </Link>
    </div>
  );
}
