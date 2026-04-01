import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { ClaimForm } from "@/components/auth/claim-form";

export const metadata: Metadata = { title: "Claim Builder Profile" };

type Props = {
  params: Promise<{ builderSlug: string }>;
};

export default async function ClaimPage({ params }: Props) {
  const { builderSlug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?callbackUrl=/auth/claim/${builderSlug}`);
  }

  if (user.role !== "BUILDER") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Builder Role Required</h1>
          <p className="mt-2 text-gray-600">You need a builder account to claim a profile.</p>
        </div>
      </div>
    );
  }

  const builder = await prisma.builder.findFirst({
    where: { slug: builderSlug, deletedAt: null },
  });

  if (!builder) notFound();

  if (builder.isClaimed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Already Claimed</h1>
          <p className="mt-2 text-gray-600">This builder profile has already been claimed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ClaimForm builderSlug={builderSlug} builderName={builder.name} />
      </div>
    </div>
  );
}
