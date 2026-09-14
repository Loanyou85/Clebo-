import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "CGV de Clebo : prix, paiement, accès aux programmes, droit de rétractation, garantie 30 jours et exclusions.",
};

/*
  EMPLACEMENT À REMPLIR — identité du vendeur et médiateur.
  Complète l'article 1 avec tes informations légales (les mêmes que dans
  les mentions légales), et l'article 10 avec le médiateur de la
  consommation auquel tu adhères : l'adhésion à un médiateur est
  OBLIGATOIRE pour vendre à des particuliers en France (article L612-1 du
  Code de la consommation), et son nom doit figurer ici.
*/
export default function CgvPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-3">Conditions générales de vente</h1>
      <p className="text-sm text-sourdine mb-10">Dernière mise à jour : à la mise en ligne du site.</p>

      <Article titre="1. Vendeur">
        À compléter : nom ou dénomination, statut juridique, SIRET, adresse et email de contact —
        identiques aux mentions légales.
      </Article>

      <Article titre="2. Objet">
        Clebo vend des programmes d&apos;éducation canine en ligne, sous forme de contenus numériques
        accessibles depuis un compte personnel : séances datées, consignes écrites, vidéos de
        démonstration, journal de progression.
      </Article>

      <Article titre="3. Prix">
        Les prix sont indiqués en euros toutes taxes comprises. Un programme est vendu 59 € en
        paiement unique. L&apos;abonnement optionnel « Suivi Clebo » est de 14,99 € par mois. Les
        prix en vigueur sont ceux affichés au moment de la commande.
      </Article>

      <Article titre="4. Paiement">
        Le paiement s&apos;effectue en ligne via Stripe. Clebo n&apos;a jamais accès aux données de
        carte bancaire, qui sont traitées directement par Stripe.
      </Article>

      <Article titre="5. Accès au produit">
        L&apos;achat d&apos;un programme donne un accès immédiat et à vie à ce programme depuis ton
        compte, sans abonnement. L&apos;abonnement « Suivi Clebo » donne accès à l&apos;ensemble des
        programmes tant qu&apos;il est actif, et se résilie à tout moment depuis l&apos;espace
        client, sans préavis ni frais.
      </Article>

      <Article titre="6. Droit de rétractation et renonciation expresse">
        Conformément à l&apos;article L221-18 du Code de la consommation, tu disposes d&apos;un délai
        de 14 jours pour te rétracter. Toutefois, s&apos;agissant d&apos;un contenu numérique fourni
        immédiatement, tu demandes expressément son exécution avant la fin de ce délai et renonces à
        ton droit de rétractation dès l&apos;accès au programme, conformément à l&apos;article
        L221-28 13° du même code. Cette renonciation est recueillie de façon explicite au moment du
        paiement.
      </Article>

      <Article titre="7. Garantie commerciale 30 jours">
        Indépendamment du droit de rétractation, Clebo rembourse intégralement tout programme sur
        simple demande envoyée dans les 30 jours suivant l&apos;achat, sans justification à fournir.
        Cette garantie commerciale s&apos;ajoute aux garanties légales et ne les remplace pas.
      </Article>

      <Article titre="8. Exclusions : agressivité, morsure, réactivité">
        Clebo ne traite aucun cas d&apos;agressivité, de morsure ou de réactivité envers les animaux
        ou les humains. Ces situations nécessitent l&apos;intervention d&apos;un vétérinaire
        comportementaliste ou d&apos;un éducateur canin en présentiel. Aucun programme Clebo ne doit
        être utilisé pour tenter de traiter ces comportements.
      </Article>

      <Article titre="9. Absence de garantie de résultat">
        Les programmes décrivent des méthodes d&apos;éducation en renforcement positif. La plupart
        des chiens progressent avec un travail régulier, mais le comportement d&apos;un animal dépend
        de nombreux facteurs (santé, âge, historique, régularité du travail) : aucun résultat ne peut
        être garanti. Les contenus ne remplacent ni un avis vétérinaire, ni un professionnel du
        comportement.
      </Article>

      <Article titre="10. Réclamation et médiation">
        Toute réclamation peut être adressée à l&apos;email de contact indiqué à l&apos;article 1. En
        cas de litige non résolu, tu peux recourir gratuitement au médiateur de la consommation dont
        relève le vendeur : à compléter avec le nom et l&apos;adresse du médiateur auquel le vendeur
        adhère. Tu peux également utiliser la plateforme européenne de règlement en ligne des
        litiges.
      </Article>

      <Article titre="11. Droit applicable">
        Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux
        français sont compétents, sous réserve des règles protectrices applicables aux consommateurs.
      </Article>
    </div>
  );
}

function Article({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="titre text-titre-s mb-2">{titre}</h2>
      <p className="prose-clebo text-sourdine">{children}</p>
    </section>
  );
}
