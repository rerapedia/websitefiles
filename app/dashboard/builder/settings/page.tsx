import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function BuilderSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "BUILDER") redirect("/dashboard/saved");

  const builder = await prisma.builder.findFirst({
    where: { claimedByUserId: user.id, deletedAt: null },
  });

  if (!builder) redirect("/dashboard/builder");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      <p className="mt-1 text-sm text-gray-600">Update your builder profile information</p>
      <div className="mt-6 max-w-xl">
        <SettingsForm
          description={builder.description ?? ""}
          website={builder.website ?? ""}
          phone={builder.phone ?? ""}
          email={builder.email ?? ""}
          logoUrl={builder.logoUrl ?? ""}
        />
      </div>
    </div>
  );
}
