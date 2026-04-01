"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import clsx from "clsx";

export function SaveProjectButton({
  projectId,
  initialSaved = false,
  size = "sm",
}: {
  projectId: string;
  initialSaved?: boolean;
  size?: "sm" | "md";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    setSaved(!saved); // Optimistic

    try {
      const res = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.data.saved);
      } else {
        setSaved(!saved); // Revert
      }
    } catch {
      setSaved(!saved); // Revert
    } finally {
      setLoading(false);
    }
  }

  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={clsx(
        "flex items-center justify-center rounded-full transition hover:bg-gray-100",
        sizeClasses,
      )}
      aria-label={saved ? "Unsave project" : "Save project"}
    >
      <Heart
        className={clsx(
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          saved ? "fill-red-500 text-red-500" : "text-gray-400",
        )}
      />
    </button>
  );
}
