import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync } from "fs";
import { join } from "path";
import { BREEDS } from "./data/breeds";
import { BASE_EXERCISES } from "./data/exercises";

const prisma = new PrismaClient();

// Une vraie photo (public/breeds/<slug>.jpg) prime sur l'illustration
// placeholder générée par code dès qu'elle existe — aucune liste à tenir
// à jour manuellement, il suffit d'ajouter le fichier.
function breedImageUrl(slug: string): string {
  const hasPhoto = existsSync(join(process.cwd(), "public", "breeds", `${slug}.jpg`));
  return hasPhoto ? `/breeds/${slug}.jpg` : `/breeds/${slug}.svg`;
}

const FOOD_BRANDS: Array<{
  name: string;
  description: string;
  forAllBreeds: boolean;
  breedSlugs?: string[];
}> = [
  {
    name: "Royal Canin",
    description:
      "Formules spécifiques par race (gabarit de croquette et profil nutritionnel adaptés à la mâchoire et à la morphologie).",
    forAllBreeds: false,
    breedSlugs: [
      "labrador",
      "berger-allemand",
      "bouledogue-francais",
      "chihuahua",
      "cocker-spaniel",
      "shih-tzu",
    ],
  },
  {
    name: "Purina Pro Plan",
    description: "Gammes par taille et niveau d'activité, bon rapport qualité/prix pour un usage quotidien.",
    forAllBreeds: true,
  },
  {
    name: "Hill's Science Plan",
    description: "Formules pensées avec des vétérinaires, adaptées à l'âge et à la sensibilité digestive.",
    forAllBreeds: true,
  },
  {
    name: "Ultra Premium Direct",
    description: "Croquettes françaises formulées sur-mesure selon le poids et l'activité du chien, vente directe.",
    forAllBreeds: true,
  },
  {
    name: "Orijen",
    description: "Formules riches en protéines animales, orientées vers les races actives et sportives.",
    forAllBreeds: false,
    breedSlugs: ["border-collie", "berger-australien", "husky-siberien", "jack-russell"],
  },
  {
    name: "Edgard & Cooper",
    description: "Recettes naturelles sans céréales controversées, bon choix pour les chiens sensibles.",
    forAllBreeds: false,
    breedSlugs: ["bouledogue-francais", "cavalier-king-charles", "shih-tzu", "cocker-spaniel"],
  },
];

async function main() {
  console.log("Seed: races...");
  const breedIdBySlug = new Map<string, string>();
  for (const b of BREEDS) {
    const breed = await prisma.breed.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: b.description,
        temperament: b.temperament,
        weightMinKg: b.weightMinKg,
        weightMaxKg: b.weightMaxKg,
        imageUrl: breedImageUrl(b.slug),
      },
      create: {
        slug: b.slug,
        name: b.name,
        description: b.description,
        temperament: b.temperament,
        weightMinKg: b.weightMinKg,
        weightMaxKg: b.weightMaxKg,
        imageUrl: breedImageUrl(b.slug),
      },
    });
    breedIdBySlug.set(b.slug, breed.id);
  }

  console.log("Seed: exercices...");
  for (const ex of BASE_EXERCISES) {
    const exercise = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {
        title: ex.title,
        level: ex.level,
        description: ex.description,
        repetitions: ex.repetitions,
        frequencyPerDay: ex.frequencyPerDay,
        durationWeeks: ex.durationWeeks,
        forAllBreeds: ex.forAllBreeds,
        imageUrl: ex.imageUrl,
        videoUrl: ex.videoUrl,
      },
      create: {
        slug: ex.slug,
        title: ex.title,
        level: ex.level,
        description: ex.description,
        repetitions: ex.repetitions,
        frequencyPerDay: ex.frequencyPerDay,
        durationWeeks: ex.durationWeeks,
        forAllBreeds: ex.forAllBreeds,
        imageUrl: ex.imageUrl,
        videoUrl: ex.videoUrl,
      },
    });

    if (!ex.forAllBreeds && ex.breedSlugs) {
      for (const slug of ex.breedSlugs) {
        const breedId = breedIdBySlug.get(slug);
        if (!breedId) continue;
        await prisma.exerciseBreed.upsert({
          where: { exerciseId_breedId: { exerciseId: exercise.id, breedId } },
          update: {},
          create: { exerciseId: exercise.id, breedId },
        });
      }
    }
  }

  console.log("Seed: marques de nourriture...");
  for (const brand of FOOD_BRANDS) {
    const existing = await prisma.foodBrand.findFirst({ where: { name: brand.name } });
    const foodBrand = existing
      ? await prisma.foodBrand.update({
          where: { id: existing.id },
          data: { description: brand.description, forAllBreeds: brand.forAllBreeds },
        })
      : await prisma.foodBrand.create({
          data: { name: brand.name, description: brand.description, forAllBreeds: brand.forAllBreeds },
        });

    if (!brand.forAllBreeds && brand.breedSlugs) {
      for (const slug of brand.breedSlugs) {
        const breedId = breedIdBySlug.get(slug);
        if (!breedId) continue;
        await prisma.foodBrandBreed.upsert({
          where: { foodBrandId_breedId: { foodBrandId: foodBrand.id, breedId } },
          update: {},
          create: { foodBrandId: foodBrand.id, breedId },
        });
      }
    }
  }

  console.log("Seed: compte admin...");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@clebo.fr";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ClangeMoiVite123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true },
    create: { email: adminEmail, passwordHash, isAdmin: true },
  });
  console.log(`Compte admin prêt -> ${adminEmail} / ${adminPassword} (à changer en prod)`);

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
