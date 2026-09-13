import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Gratuit pour le diagnostic et les 3 premiers jours. 59 € une fois pour un programme complet, accès à vie. Suivi Clebo à 14,99 €/mois en option.",
};

export default function TarifsPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-4">Un éducateur canin coûte 60 € la séance</h1>
      <p className="prose-clebo text-encre-doux mb-12">
        Clebo coûte le prix d&apos;une seule séance, pour 30 jours de travail encadré. Sans
        abonnement obligatoire : tu paies une fois, tu gardes l&apos;accès à vie.
      </p>

      <div className="flex flex-col gap-4 mb-12">
        <div className="card-surface p-6">
          <p className="badge mb-3">Gratuit</p>
          <p className="titre text-titre-s mb-4">0 €</p>
          <ul className="flex flex-col gap-2 text-sm text-encre-doux mb-5">
            <li>Le diagnostic complet et ton plan personnalisé</li>
            <li>Les 3 premiers jours de n&apos;importe quel programme</li>
            <li>Les fiches de race et le calculateur de rations</li>
          </ul>
          <Link href="/diagnostic" className="btn-outline">
            Commencer le diagnostic
          </Link>
        </div>

        <div className="card-surface p-6 border-signal">
          <p className="badge mb-3">Le plus choisi</p>
          <p className="titre text-titre-s mb-1">59 € une fois</p>
          <p className="text-sm text-encre-doux mb-4">Accès à vie, sans abonnement</p>
          <ul className="flex flex-col gap-2 text-sm text-encre-doux mb-5">
            <li>Un programme complet de 30 jours sur le problème de ton chien</li>
            <li>Une séance datée par jour, avec l&apos;erreur à ne pas commettre</li>
            <li>Le journal de séances et la courbe de progression</li>
            <li>Le certificat de fin de programme</li>
          </ul>
          <Link href="/programmes" className="btn-primary">
            Voir les programmes
          </Link>
          <p className="text-sm text-encre-doux mt-3">
            Satisfait ou remboursé pendant 30 jours, sans justification.
          </p>
        </div>

        <div className="card-surface p-6">
          <p className="badge mb-3">Option</p>
          <p className="titre text-titre-s mb-1">14,99 € par mois</p>
          <p className="text-sm text-encre-doux mb-4">Suivi Clebo, résiliable en un clic</p>
          <ul className="flex flex-col gap-2 text-sm text-encre-doux">
            <li>Tous les programmes, y compris les prochains</li>
            <li>Les exercices sur-mesure générés pour ton chien</li>
            <li>Les nouveaux contenus au fil des mois</li>
          </ul>
          <p className="text-sm text-encre-doux mt-4">
            Proposé après ton premier programme : inutile de t&apos;abonner pour commencer.
          </p>
        </div>
      </div>

      <h2 className="titre text-titre-s mb-3">Pourquoi pas seulement un abonnement ?</h2>
      <p className="prose-clebo text-encre-doux">
        Parce que ton besoin a une fin. Quand ton chien marche en laisse, tu n&apos;as plus de raison
        de payer tous les mois, et te pousser à le faire serait malhonnête. L&apos;abonnement existe
        pour ceux qui veulent continuer avec d&apos;autres programmes, pas pour retenir les autres.
      </p>
    </div>
  );
}
