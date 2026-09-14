import Link from "next/link";

import { prisma } from "@/lib/prisma";
import HeroDiagnostic from "@/components/HeroDiagnostic";
import ProgramScrollStory from "@/components/ProgramScrollStory";
import ApercuEspace from "@/components/ApercuEspace";
import CarrouselRaces from "@/components/CarrouselRaces";
import StepperDiagnostic from "@/components/StepperDiagnostic";
import OngletsFonctionnalites from "@/components/OngletsFonctionnalites";
import TableauComparatif from "@/components/TableauComparatif";
import FaqAccordeon from "@/components/FaqAccordeon";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import FlecheCourbe from "@/components/decor/FlecheCourbe";

/** Étapes de secours pour la section à scroll figé, si le programme de
 *  référence n'a pas encore ses séances générées. */
const ETAPES_DEMO = [
  {
    dayNumber: 1,
    objective: "Trois pas laisse détendue dans le couloir, sans distraction.",
    durationMin: 5,
    repetitions: 5,
    commonMistake: "Commencer dehors. Le trottoir contient trop d'odeurs pour un premier jour.",
  },
  {
    dayNumber: 8,
    objective: "Vingt pas laisse détendue dans le jardin ou la cour.",
    durationMin: 8,
    repetitions: 4,
    commonMistake: "Tirer sur la laisse pour corriger : le chien tire toujours dans le sens inverse.",
  },
  {
    dayNumber: 16,
    objective: "Le tour du pâté de maisons avec un demi-tour à chaque tension.",
    durationMin: 10,
    repetitions: 3,
    commonMistake: "Avancer laisse tendue « juste une fois » quand on est pressé. Ça annule la semaine.",
  },
  {
    dayNumber: 24,
    objective: "Croiser un autre chien à dix mètres sans que la laisse se tende.",
    durationMin: 10,
    repetitions: 3,
    commonMistake: "Raccourcir la laisse en voyant l'autre chien : la tension vient alors de toi.",
  },
  {
    dayNumber: 30,
    objective: "Une vraie promenade en ville, laisse détendue du départ au retour.",
    durationMin: 15,
    repetitions: 1,
    commonMistake: "Arrêter les séances le jour 30 : on garde une séance courte par semaine.",
  },
];

const ONGLETS = [
  {
    id: "programme",
    label: "Le programme",
    titre: "Une séance par jour, dans l'ordre",
    texte:
      "Pas un catalogue dans lequel se perdre. Chaque jour a un seul objectif, un seul exercice, et l'erreur précise à ne pas commettre ce jour-là.",
    points: [
      "Les jours à venir restent verrouillés",
      "Cinq à quinze minutes, jamais plus",
      "Une vidéo de démonstration par exercice",
    ],
  },
  {
    id: "journal",
    label: "Le journal",
    titre: "Une seule question après chaque séance",
    texte:
      "Combien de réussites sur dix ? C'est tout. La courbe se construit toute seule et montre noir sur blanc si ça avance.",
    points: ["Une courbe par chien", "Reprise là où tu t'es arrêté", "Historique de toutes tes séances"],
  },
  {
    id: "races",
    label: "Les races",
    titre: "Adapté au chien que tu as vraiment",
    texte:
      "Quinze races pré-chargées, et si la tienne manque — race rare ou croisé — tu la crées et sa fiche complète est générée pour toi.",
    points: ["Gabarit, tempérament, difficultés typiques", "Fonctionne aussi pour les croisés", "Gratuit, sans compte"],
  },
  {
    id: "rations",
    label: "Les rations",
    titre: "Combien de croquettes, combien d'eau",
    texte:
      "Le calcul vétérinaire standard, à partir du poids, de l'âge et du lieu de vie de ton chien. Gratuit et sans compte, comme les fiches de race.",
    points: ["Grammes de croquettes par jour", "Litres d'eau et nombre de repas", "Formule expliquée, pas une boîte noire"],
  },
];

const FAQ = [
  {
    question: "Combien de temps par jour, vraiment ?",
    reponse:
      "Cinq à quinze minutes selon la séance, une fois par jour. C'est volontairement court : au-delà, un chien décroche et la séance devient contre-productive. La régularité compte infiniment plus que la durée.",
  },
  {
    question: "Ça marche sur un chien adulte, ou seulement sur un chiot ?",
    reponse:
      "Les deux. Un chiot apprend plus vite, un adulte a des habitudes à défaire, ce qui demande parfois quelques jours de plus sur les premières étapes. Les programmes fonctionnent dans les deux cas, et le diagnostic tient compte de l'âge.",
  },
  {
    question: "Et si ça ne marche pas pour mon chien ?",
    reponse:
      "Tu es remboursé intégralement sur simple demande pendant 30 jours, sans avoir à te justifier. La plupart des chiens progressent nettement en trois semaines de travail régulier, mais personne d'honnête ne peut garantir le comportement d'un animal.",
  },
  {
    question: "Mon chien grogne et a déjà pincé. Vous traitez ça ?",
    reponse:
      "Non, et c'est volontaire. L'agressivité, la morsure et la réactivité demandent l'œil d'un professionnel en présentiel : un mauvais conseil donné à distance peut mener à une morsure. Si c'est ton cas, on te renvoie vers un vétérinaire puis un comportementaliste, sans rien te vendre.",
  },
];

export default async function AccueilPage() {
  const [races, programmes, programmeReference, chiensAccompagnes, seancesEcrites] = await Promise.all([
    prisma.breed.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, imageUrl: true },
    }),
    prisma.program.findMany({
      orderBy: { title: "asc" },
      select: { slug: true, title: true, summary: true, durationDays: true, priceCents: true, published: true },
    }),
    prisma.program.findUnique({
      where: { slug: "marche-en-laisse" },
      select: {
        days: {
          where: { dayNumber: { in: [1, 8, 16, 24, 30] } },
          orderBy: { dayNumber: "asc" },
          select: {
            dayNumber: true,
            objective: true,
            durationMin: true,
            repetitions: true,
            commonMistake: true,
          },
        },
      },
    }),
    prisma.dog.count(),
    prisma.programDay.count(),
  ]);

  const etapes = programmeReference?.days.length ? programmeReference.days : ETAPES_DEMO;

  return (
    <>
      <HeroDiagnostic
        races={races.map(({ slug, name }) => ({ slug, name }))}
        chiensAccompagnes={chiensAccompagnes}
      />

      {/* Bento : les trois manques que Clebo comble, un par carte. */}
      <section className="container-page py-20">
        <Reveal>
          <p className="badge mb-5">Pourquoi ça bloque</p>
          <h2 className="titre text-titre-m mb-4 max-w-2xl">
            Tu ne manques pas d&apos;information. Tout est déjà sur YouTube.
          </h2>
          <p className="text-sourdine prose-clebo mb-10">
            Si ton chien tire encore, c&apos;est pour trois raisons précises, et aucune ne se règle
            avec une vidéo de plus.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              titre: "Un plan daté",
              texte:
                "Tu sais quoi faire aujourd'hui, et seulement aujourd'hui. Pas une bibliothèque de 200 vidéos dans laquelle choisir.",
              grad: "var(--grad-1)",
            },
            {
              titre: "Un retour sur ta technique",
              texte:
                "Chaque séance te dit l'erreur exacte que font la plupart des gens ce jour-là. C'est presque toujours le timing ou la récompense.",
              grad: "var(--grad-2)",
            },
            {
              titre: "Une courbe qui monte",
              texte:
                "Six sur dix en semaine une, neuf sur dix en semaine trois. Sans cette mesure, on croit stagner et on abandonne.",
              grad: "var(--grad-3)",
            },
          ].map((carte, index) => (
            <Reveal key={carte.titre} delay={index * 0.06}>
              <div className="panneau p-6 h-full">
                <div
                  aria-hidden
                  className="h-24 rounded-[var(--r-petit)] mb-5"
                  style={{ background: carte.grad, opacity: 0.9 }}
                />
                <h3 className="titre text-titre-s mb-2">{carte.titre}</h3>
                <p className="text-sourdine text-sm">{carte.texte}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ProgramScrollStory etapes={etapes} />

      {/* Les trois étapes, avec les vrais boutons du diagnostic. */}
      <section className="container-page py-20">
        <Reveal>
          <p className="badge mb-5">Comment ça marche</p>
          <div className="flex items-start justify-between gap-6 mb-10">
            <h2 className="titre text-titre-m max-w-xl">
              Du diagnostic au premier résultat, en trois étapes.
            </h2>
            <FlecheCourbe className="decor-desktop shrink-0 mt-2" miroir />
          </div>
        </Reveal>
        <StepperDiagnostic />
      </section>

      {/* La section qui justifie les 59 € en une image. */}
      <section className="relative overflow-hidden py-20">
        <div className="halo top-0" aria-hidden />
        <div className="container-page relative">
          <Reveal>
            <p className="badge mb-5">Comparé au reste</p>
            <h2 className="titre text-titre-m mb-4 max-w-2xl">
              Le prix d&apos;une séance d&apos;éducateur, pour trente jours encadrés.
            </h2>
            <p className="text-sourdine prose-clebo mb-10">
              Un éducateur canin fait mieux que nous sur un point, et on le dit : il voit ton chien
              en vrai. Sur tout le reste, voilà ce que ça donne.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <TableauComparatif />
          </Reveal>
        </div>
      </section>

      {/* L'interface réelle, rendue en direct par les composants du produit :
          ni maquette dessinée, ni capture figée qui mentirait dès la
          prochaine modification de l'interface. */}
      <section className="container-page py-20">
        <Reveal>
          <p className="badge mb-5">Ton espace</p>
          <h2 className="titre text-titre-m mb-4 max-w-2xl">
            Tout tient sur un écran : la séance du jour, et où tu en es.
          </h2>
          <p className="text-sourdine prose-clebo mb-10">
            Pas de tableau de bord à déchiffrer. Tu ouvres, tu vois ce qu&apos;il y a à faire
            aujourd&apos;hui, tu coches, la courbe monte.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <ApercuEspace />
        </Reveal>
      </section>

      <section className="container-page py-20">
        <Reveal>
          <p className="badge mb-5">Dans le détail</p>
          <h2 className="titre text-titre-m mb-10 max-w-2xl">Ce que tu as en main, concrètement.</h2>
        </Reveal>
        <Reveal delay={0.06}>
          <OngletsFonctionnalites onglets={ONGLETS} />
        </Reveal>
      </section>

      <section className="py-10">
        <div className="container-page mb-6">
          <Reveal>
            <p className="badge mb-5">Les races</p>
            <h2 className="titre text-titre-s max-w-2xl">
              Quinze races pré-chargées, et la tienne si elle manque.
            </h2>
          </Reveal>
        </div>
        <CarrouselRaces races={races.slice(0, 12)} />
      </section>

      {/* Compteurs : uniquement des chiffres réels tirés de la base. Aucun
          chiffre gonflé, c'est une pratique commerciale trompeuse. */}
      <section className="container-page py-20">
        <Reveal>
          <div className="panneau-2 p-8 grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="titre text-titre-m text-signal-texte">
                <Counter valeur={programmes.length} />
              </p>
              <p className="text-sm text-sourdine mt-1">programmes de 30 jours</p>
            </div>
            <div>
              <p className="titre text-titre-m text-signal-texte">
                <Counter valeur={seancesEcrites} />
              </p>
              <p className="text-sm text-sourdine mt-1">séances écrites</p>
            </div>
            <div>
              <p className="titre text-titre-m text-signal-texte">
                <Counter valeur={chiensAccompagnes} />
              </p>
              <p className="text-sm text-sourdine mt-1">chiens accompagnés</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/*
        EMPLACEMENT À REMPLIR — témoignages.
        Remplace les trois cartes ci-dessous par de vrais retours : prénom
        réel, photo du chien dans /public/temoignages/, problème résolu et
        durée. N'invente jamais d'avis : les faux avis sont sanctionnés, et
        un site de vente sans preuve sociale réelle ne convertit pas.
      */}
      <section className="container-page py-20">
        <Reveal>
          <p className="badge mb-5">Ils l&apos;ont fait avant toi</p>
          <h2 className="titre text-titre-m mb-10 max-w-2xl">Les premiers retours arrivent ici.</h2>
          <div className="panneau p-6">
            <p className="text-sourdine prose-clebo">
              Cet emplacement restera vide tant qu&apos;il n&apos;y aura pas de vrais témoignages de
              clients. On préfère une page honnête à des avis inventés.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-20">
        <Reveal>
          <p className="badge mb-5">Les programmes</p>
          <h2 className="titre text-titre-m mb-8 max-w-2xl">Un problème, un programme.</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {programmes.map((programme, index) => (
            <Reveal key={programme.slug} delay={index * 0.05}>
              <Link href={`/programmes/${programme.slug}`} className="panneau p-6 block h-full">
                <p className="font-semibold mb-2">{programme.title}</p>
                <p className="text-sm text-sourdine mb-4">{programme.summary}</p>
                <p className="text-sm font-semibold text-signal-texte">
                  {programme.durationDays} jours ·{" "}
                  {(programme.priceCents / 100).toFixed(2).replace(".", ",")} € une fois
                  {!programme.published && " · bientôt"}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <Reveal>
          <p className="badge mb-5">Questions fréquentes</p>
          <h2 className="titre text-titre-m mb-8 max-w-2xl">Ce qu&apos;on nous demande le plus.</h2>
        </Reveal>
        <Reveal delay={0.06}>
          <FaqAccordeon questions={FAQ} />
        </Reveal>
      </section>

      <section className="relative overflow-hidden pb-24">
        <div className="halo bottom-0" aria-hidden />
        <div className="container-page relative text-center">
          <Reveal>
            <h2 className="titre text-titre-m mb-5 max-w-2xl mx-auto">
              Commence par savoir où en est ton chien.
            </h2>
            <p className="text-sourdine prose-clebo mx-auto mb-8">
              Six questions, quarante secondes. Tu vois immédiatement le programme adapté et ses
              trois premières séances, sans rien payer.
            </p>
            <Link href="/diagnostic" className="btn-primary">
              Commencer le diagnostic
            </Link>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-sourdine">
              <span>Sans carte bancaire pour le diagnostic</span>
              <span>59 € une fois, accès à vie</span>
              <span>Remboursé sous 30 jours</span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
