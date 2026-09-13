import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Clebo collecte, pourquoi, combien de temps, et comment exercer tes droits.",
};

/*
  EMPLACEMENT À REMPLIR — responsable de traitement.
  Complète le premier bloc avec ton identité et une adresse email de
  contact réelle pour les demandes RGPD : elle doit fonctionner, c'est par
  là que transiteront les demandes d'accès et de suppression.
*/
export default function ConfidentialitePage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-8">Politique de confidentialité</h1>

      <Bloc titre="Responsable du traitement">
        À compléter : nom ou dénomination du responsable de traitement et adresse email dédiée aux
        demandes relatives aux données personnelles.
      </Bloc>

      <Bloc titre="Données collectées">
        Ton adresse email et ton mot de passe (stocké uniquement sous forme chiffrée, jamais en
        clair), ou ton identifiant Google si tu passes par « Continuer avec Google ». Les
        informations sur ton chien que tu saisis toi-même : nom, race, taille, poids, âge,
        environnement de vie. Tes réponses au diagnostic. Tes séances validées et leurs scores. Les
        informations de facturation gérées par Stripe.
      </Bloc>

      <Bloc titre="Pourquoi ces données">
        Pour te donner accès à ton compte et à tes programmes, adapter les séances à ton chien,
        afficher ta progression, traiter tes paiements et répondre à tes demandes. Le diagnostic est
        enregistré même sans compte, sous forme anonyme, pour comprendre quels problèmes amènent les
        visiteurs sur le site.
      </Bloc>

      <Bloc titre="Base légale">
        L&apos;exécution du contrat pour tout ce qui concerne ton compte, tes programmes et tes
        paiements. L&apos;intérêt légitime pour la mesure d&apos;audience anonyme du diagnostic.
      </Bloc>

      <Bloc titre="Combien de temps">
        Tes données de compte sont conservées tant que ton compte existe, puis supprimées dans les 30
        jours suivant sa suppression. Les données de facturation sont conservées 10 ans, comme
        l&apos;impose la loi comptable.
      </Bloc>

      <Bloc titre="Qui y a accès">
        Clebo ne vend ni ne loue aucune donnée. Des prestataires techniques les traitent pour notre
        compte : Vercel (hébergement du site), Neon (base de données, Union européenne), Stripe
        (paiements), Anthropic (génération des contenus de programmes — aucune donnée personnelle ne
        lui est transmise), Google (connexion Google et vidéos YouTube intégrées).
      </Bloc>

      <Bloc titre="Tes droits">
        Tu peux demander l&apos;accès, la rectification, la suppression ou la portabilité de tes
        données, ainsi que la limitation ou l&apos;opposition à leur traitement, en écrivant à
        l&apos;adresse indiquée plus haut. Tu peux aussi introduire une réclamation auprès de la CNIL
        (cnil.fr).
      </Bloc>

      <Bloc titre="Cookies">
        Clebo n&apos;utilise que des cookies strictement nécessaires à son fonctionnement : le cookie
        de session qui te garde connecté, et un cookie temporaire de sécurité lors de la connexion
        avec Google. Aucun cookie publicitaire, aucun traceur tiers, aucune mesure d&apos;audience
        n&apos;est déposé. Ces cookies nécessaires ne requièrent pas ton consentement préalable :
        c&apos;est pourquoi aucun bandeau ne t&apos;est imposé à l&apos;arrivée. Si une mesure
        d&apos;audience était ajoutée plus tard, un bandeau de consentement conforme apparaîtrait,
        avec un refus aussi simple que l&apos;acceptation.
      </Bloc>

      <Bloc titre="Vidéos YouTube">
        Les vidéos de démonstration sont intégrées depuis YouTube. En lisant une vidéo, tu établis
        une connexion avec les serveurs de Google, qui peut déposer ses propres cookies selon ses
        conditions. Les vidéos ne se lancent jamais automatiquement.
      </Bloc>
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="titre text-titre-s mb-2">{titre}</h2>
      <p className="prose-clebo text-encre-doux">{children}</p>
    </section>
  );
}
