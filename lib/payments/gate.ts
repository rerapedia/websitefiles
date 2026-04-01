import { prisma } from "@/lib/db/prisma";

export type SubscriptionTier = "free" | "investor" | "broker" | "silver" | "gold";

export async function getUserSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { plan: true },
    orderBy: { currentPeriodEnd: "desc" },
  });
}

export async function getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const sub = await getUserSubscription(userId);
  if (!sub) return "free";
  const slug = sub.plan.slug;
  if (slug === "builder-gold") return "gold";
  if (slug === "builder-silver") return "silver";
  if (slug === "broker-plan") return "broker";
  if (slug === "investor-premium") return "investor";
  return "free";
}

export async function hasFeature(userId: string, feature: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  const features = sub.plan.featuresJson as Record<string, unknown> | null;
  if (!features) return false;
  return !!features[feature];
}
