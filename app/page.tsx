import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HeroDiagnostic from "@/components/HeroDiagnostic";
import ProgramScrollStory from "@/components/ProgramScrollStory";
import Counter from "@/components/Counter";

/** Étapes montrées dans la section à scroll figé. Si le programme de
 *  référence n'a pas encore ses séances générées, on retombe sur ces
 *  exemples plutôt que d'afficher une section vide. */
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

export default async function AccueilPage() {
  const [races, programmes, programmeReference] = await Promise.all([
    prisma.breed.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    prisma.program.findMany({
      orderBy: { title: "asc" },
      select: { slug: true, title: true, promise: true, durationDays: true, priceCents: true },
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
  ]);

  const etapes = programmeReference?.days.length ? programmeReference.days : ETAPES_DEMO;

  return (
    <>
      <HeroDiagnostic races={races} />

      <section className="container-page pb-20 max-w-2xl">
        <h2 className="titre text-titre-s mb-5">Pourquoi ça ne marche pas jusqu&apos;ici</h2>
        <div className="flex flex-col gap-4">
          <p className="prose-clebo text-encre-doux">
            Tu ne manques pas d&apos;information : tout est déjà sur YouTube, gratuitement. Si ton
            chien tire encore, c&apos;est pour trois raisons, et aucune ne se règle avec une vidéo de
            plus.
          </p>
          <div className="card-surface p-5">
            <p className="font-semibold mb-1">Personne ne te dit ce qui cloche</p>
            <p className="text-sm text-encre-doux">
              Tu reproduis l&apos;exercice, le chien ne réagit pas, et tu ne sais pas si le problème
              vient du timing, de la récompense, de la durée ou de l&apos;endroit.
            </p>
          </div>
          <div className="card-surface p-5">
            <p className="font-semibold mb-1">Tu abandonnes au jour 4</p>
            <p className="text-sm text-encre-doux">
              Le dressage demande 5 à 10 minutes par jour pendant trois semaines. Sans cadre ni
              rappel, presque tout le monde décroche au bout de quelques jours.
            </p>
          </div>
          <div className="card-surface p-5">
            <p className="font-semibold mb-1">Tu ne vois pas les progrès</p>
            <p className="text-sm text-encre-doux">
              Sans mesure, l&apos;impression de stagner l&apos;emporte toujours, même quand le chien
              s&apos;améliore réellement.
            </p>
          </div>
        </div>
      </section>

      <ProgramScrollStory etapes={etapes} />

      <section className="container-page py-20 max-w-2xl">
        <h2 className="titre text-titre-s mb-3">Ce que tu notes après chaque séance</h2>
        <p className="prose-clebo text-encre-doux mb-6">
          Une seule question : combien de réussites sur 10 ? C&apos;est ce qui construit la courbe de
          ton chien. Voir 6/10 en semaine 1 puis 9/10 en semaine 3, c&apos;est ce qui donne envie de
          continuer le jour où la motivation baisse.
        </p>
        <div className="card-surface p-6">
          <p className="text-sm text-encre-doux mb-2">Exemple de progression sur trois semaines</p>
          <div className="flex items-end gap-2 h-28" aria-hidden>
            {[4, 5, 5, 6, 7, 7, 8, 9].map((valeur, i) => (
              <div key={i} className="flex-1 bg-signal rounded-t-[4px]" style={{ height: `${valeur * 10}%` }} />
            ))}
          </div>
          <p className="text-sm text-encre-doux mt-3">De 4/10 le premier jour à 9/10 au jour 21.</p>
        </div>
      </section>

      <section className="container-page pb-20 max-w-2xl">
        <h2 className="titre text-titre-s mb-5">Les programmes</h2>
        <div className="flex flex-col gap-3">
          {programmes.map((programme) => (
            <Link
              key={programme.slug}
              href={`/programmes/${programme.slug}`}
              className="card-surface p-5 hover:border-encre transition-colors"
            >
              <p className="font-semibold mb-1">{programme.title}</p>
              <p className="text-sm text-encre-doux">
                {programme.durationDays} jours · {(programme.priceCents / 100).toFixed(2).replace(".", ",")} € une
                fois, accès à vie
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/*
        EMPLACEMENT À REMPLIR — preuve sociale.
        Ces contenus ne sont pas inventés volontairement : remplace les trois
        témoignages ci-dessous par de vrais retours de clients (prénom réel,
        photo du chien dans /public/temoignages/, problème résolu), et mets le
        vrai nombre de chiens accompagnés dans <Counter valeur={...} />.
        Tant que ce n'est pas fait, cette section reste honnête mais vide de
        preuve : c'est le point le plus critique pour vendre à 59 €.
      */}
      <section className="container-page pb-20 max-w-2xl">
        <h2 className="titre text-titre-s mb-5">Ils l&apos;ont fait avant toi</h2>
        <p className="prose-clebo text-encre-doux mb-6">
          <Counter valeur={0} /> chiens accompagnés depuis le lancement.
        </p>
        <div className="card-surface p-5">
          <p className="text-sm text-encre-doux">
            Les premiers témoignages arriveront ici dès les premiers programmes terminés. On préfère
            cette ligne honnête à de faux avis.
          </p>
        </div>
      </section>

      <section className="container-page pb-24 max-w-2xl">
        <h2 className="titre text-titre-s mb-3">Commence par le diagnostic</h2>
        <p className="prose-clebo text-encre-doux mb-6">
          Six questions, 40 secondes, sans compte et sans carte bancaire. Tu vois immédiatement le
          programme adapté à ton chien et ses trois premières séances.
        </p>
        <Link href="/diagnostic" className="btn-primary">
          Commencer le diagnostic
        </Link>
      </section>
    </>
  );
}
