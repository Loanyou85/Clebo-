/**
 * Génère les séances des programmes avec l'IA et les enregistre en base.
 *
 *   npm run programs:generate              # tous les programmes incomplets
 *   npm run programs:generate -- laisse    # un seul, par slug ou fragment
 *   npm run programs:generate -- --force   # régénère même si déjà rempli
 *
 * Volontairement séparé du seed : c'est lent et ça consomme de l'IA, il
 * n'y a aucune raison de le relancer à chaque déploiement. Un programme
 * n'est publié (donc visible sur le site) qu'une fois ses séances en base.
 */
import { PrismaClient } from "@prisma/client";
import { PROGRAMS } from "../prisma/data/programs";
import { generateProgramDays, ProgramGenerationUnavailableError } from "../lib/programGeneration";
import { findYoutubeVideo, isYoutubeSearchConfigured } from "../lib/youtubeSearch";

const prisma = new PrismaClient();
const TAILLE_LOT = 10;

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const filtre = args.find((arg) => !arg.startsWith("--"));

  const aTraiter = PROGRAMS.filter((p) => !filtre || p.slug.includes(filtre));
  if (aTraiter.length === 0) {
    console.error(`Aucun programme ne correspond à "${filtre}".`);
    process.exit(1);
  }

  for (const seed of aTraiter) {
    const programme = await prisma.program.findUnique({
      where: { slug: seed.slug },
      include: { _count: { select: { days: true } } },
    });
    if (!programme) {
      console.log(`- ${seed.slug} : absent de la base, lance d'abord npm run db:seed.`);
      continue;
    }
    if (programme._count.days > 0 && !force) {
      console.log(`- ${seed.slug} : déjà ${programme._count.days} séances, ignoré (--force pour régénérer).`);
      continue;
    }

    console.log(`\n${seed.title} — génération de ${seed.durationDays} séances…`);

    // Une seule recherche vidéo par exercice distinct, pas par jour : 30
    // recherches par programme dépasseraient le quota YouTube gratuit
    // (100 unités par recherche, 10 000 unités par jour).
    const videos: Array<string | null> = [];
    if (isYoutubeSearchConfigured()) {
      for (const exercice of seed.exercises) {
        const trouvee = await findYoutubeVideo(`${exercice} chien dressage`);
        videos.push(trouvee?.embedUrl ?? null);
      }
      console.log(`  ${videos.filter(Boolean).length}/${seed.exercises.length} vidéos trouvées`);
    }

    const contexte = {
      title: seed.title,
      promise: seed.promise,
      summary: seed.summary,
      durationDays: seed.durationDays,
      exercises: seed.exercises,
    };

    const jours = [];
    for (let debut = 1; debut <= seed.durationDays; debut += TAILLE_LOT) {
      const fin = Math.min(seed.durationDays, debut + TAILLE_LOT - 1);
      process.stdout.write(`  jours ${debut}-${fin}… `);
      const lot = await generateProgramDays(contexte, debut, fin);
      jours.push(...lot.filter((jour) => jour.dayNumber >= debut && jour.dayNumber <= fin));
      console.log(`${lot.length} séances`);
    }

    if (force) {
      await prisma.programDay.deleteMany({ where: { programId: programme.id } });
    }

    for (const jour of jours) {
      const videoUrl = videos[jour.exerciseIndex] ?? null;
      await prisma.programDay.upsert({
        where: { programId_dayNumber: { programId: programme.id, dayNumber: jour.dayNumber } },
        update: {
          objective: jour.objective,
          instructions: jour.instructions,
          repetitions: jour.repetitions,
          durationMin: jour.durationMin,
          commonMistake: jour.commonMistake,
          videoUrl,
          aiGenerated: true,
        },
        create: {
          programId: programme.id,
          dayNumber: jour.dayNumber,
          objective: jour.objective,
          instructions: jour.instructions,
          repetitions: jour.repetitions,
          durationMin: jour.durationMin,
          commonMistake: jour.commonMistake,
          videoUrl,
          aiGenerated: true,
        },
      });
    }

    // Un programme n'est mis en vente que s'il est réellement complet.
    const total = await prisma.programDay.count({ where: { programId: programme.id } });
    const complet = total >= seed.durationDays;
    await prisma.program.update({
      where: { id: programme.id },
      data: { published: complet },
    });

    console.log(`  ${total} séances en base — ${complet ? "publié" : "incomplet, non publié"}`);
  }
}

main()
  .catch((error) => {
    if (error instanceof ProgramGenerationUnavailableError) {
      console.error(`\n${error.message}`);
      console.error("Ajoute ANTHROPIC_API_KEY dans .env.local puis relance.");
      process.exit(1);
    }
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
