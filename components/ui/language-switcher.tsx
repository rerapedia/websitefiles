"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    // Set cookie so server reads it on next request
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    // Hard reload to re-render all server components with new locale
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 text-xs">
      <button
        onClick={() => switchLocale("en")}
        className={`rounded-l-lg px-2.5 py-1.5 font-medium transition-colors ${
          locale === "en"
            ? "bg-brand-primary text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("hi")}
        className={`rounded-r-lg px-2.5 py-1.5 font-medium transition-colors ${
          locale === "hi"
            ? "bg-brand-primary text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
