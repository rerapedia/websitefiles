import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { CampaignForm } from "./campaign-form";

export const metadata: Metadata = { title: "New Campaign" };

export default async function NewCampaignPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Create Ad Campaign</h1>
      <p className="mt-1 text-sm text-gray-600">Set up a new advertising campaign</p>
      <div className="mt-6 max-w-2xl">
        <CampaignForm />
      </div>
    </div>
  );
}
