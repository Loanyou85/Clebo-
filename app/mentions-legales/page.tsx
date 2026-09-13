import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et informations légales du site Clebo.",
};

/*
  EMPLACEMENT À REMPLIR — identité légale.
  Les blocs marqués « à compléter » doivent contenir tes informations
  réelles : elles sont obligatoires pour vendre à des particuliers en
  France (article 6 de la LCEN). Je ne les invente pas, une mention légale
  fausse est pire que pas de mention du tout.
  À compléter : dénomination ou nom/prénom, statut juridique (auto-
  entrepreneur, SASU…), numéro SIRET, numéro de TVA si applicable, adresse
  du siège, téléphone, email de contact, directeur de la publication.
*/
export default function MentionsLegalesPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="titre text-titre-m mb-8">Mentions légales</h1>

      <section className="mb-10">
        <h2 className="titre text-titre-s mb-3">Éditeur du site</h2>
        <div className="card-surface p-5">
          <p className="text-sm text-encre-doux">
            À compléter avant toute mise en vente : nom ou dénomination sociale, statut juridique,
            numéro SIRET, numéro de TVA intracommunautaire le cas échéant, adresse du siège,
            téléphone, adresse email et nom du directeur de la publication.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="titre text-titre-s mb-3">Hébergement</h2>
        <p className="prose-clebo text-encre-doux">
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis. La base de données est hébergée dans l&apos;Union européenne.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="titre text-titre-s mb-3">Propriété intellectuelle</h2>
        <p className="prose-clebo text-encre-doux">
          L&apos;ensemble des contenus des programmes (textes, séances, illustrations) est protégé
          par le droit d&apos;auteur. L&apos;achat d&apos;un programme donne un droit d&apos;usage
          personnel : il n&apos;autorise ni la revente, ni la diffusion, ni le partage des contenus.
          Les vidéos de démonstration sont hébergées par YouTube et restent la propriété de leurs
          auteurs respectifs.
        </p>
      </section>

      <section>
        <h2 className="titre text-titre-s mb-3">Limite de responsabilité</h2>
        <p className="prose-clebo text-encre-doux">
          Clebo propose des programmes d&apos;éducation canine à distance. Clebo ne traite aucun cas
          d&apos;agressivité, de morsure ou de réactivité envers les animaux ou les humains, qui
          relèvent d&apos;un professionnel en présentiel. Les conseils diffusés ne remplacent ni une
          consultation vétérinaire, ni l&apos;intervention d&apos;un comportementaliste.
        </p>
      </section>
    </div>
  );
}
