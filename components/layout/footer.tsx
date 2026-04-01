import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const tc = await getTranslations("common");

  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <img src="/logo.svg" alt="ReraPedia" className="h-8 w-auto brightness-0 invert" />
            <p className="mt-2 text-sm text-gray-400">{tc("tagline")}</p>
          </div>

          {/* State links */}
          <div>
            <h3 className="font-semibold text-gray-200">{t("stateLinks")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link href="/state/haryana" className="transition-colors duration-200 hover:text-blue-400">Haryana RERA</Link></li>
              <li><Link href="/state/delhi" className="transition-colors duration-200 hover:text-blue-400">Delhi RERA</Link></li>
              <li><Link href="/state/uttar-pradesh" className="transition-colors duration-200 hover:text-blue-400">UP RERA</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-200">{t("company")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="transition-colors duration-200 hover:text-blue-400">{tc("about")}</Link></li>
              <li><Link href="/privacy-policy" className="transition-colors duration-200 hover:text-blue-400">{t("privacy")}</Link></li>
              <li><Link href="/terms" className="transition-colors duration-200 hover:text-blue-400">{t("terms")}</Link></li>
              <li><Link href="/contact" className="transition-colors duration-200 hover:text-blue-400">Contact</Link></li>
              <li><Link href="/disclaimer" className="transition-colors duration-200 hover:text-blue-400">Disclaimer</Link></li>
              <li><Link href="/blog" className="transition-colors duration-200 hover:text-blue-400">Blog</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 border-t border-gray-700/50 pt-6">
          <p className="text-xs text-gray-500">{t("disclaimer")}</p>
          <p className="mt-2 text-xs text-gray-600">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
