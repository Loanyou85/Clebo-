import type { User } from "@prisma/client";
import { prisma } from "./prisma";
import { isActiveSubscription } from "./auth";

/** Nombre de jours visibles gratuitement sur n'importe quel programme :
 *  c'est le palier gratuit (le visiteur voit concrètement ce qu'il achète). */
export const FREE_DAYS = 3;

/** Règle d'accès unique à tout le site : un programme est débloqué par un
 *  achat unique (à vie), par l'abonnement, ou par la liste blanche d'emails. */
export async function hasProgramAccess(user: User | null, programId: string): Promise<boolean> {
  if (!user) return false;
  if (isActiveSubscription(user)) return true;

  const purchase = await prisma.purchase.findUnique({
    where: { userId_programId: { userId: user.id, programId } },
    select: { id: true },
  });
  return Boolean(purchase);
}

export function isDayUnlocked(dayNumber: number, hasAccess: boolean): boolean {
  return hasAccess || dayNumber <= FREE_DAYS;
}
