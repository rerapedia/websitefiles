"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Menu, X } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function Header() {
  const t = useTranslations("common");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <img src="/logo.svg" alt="ReraPedia" className="h-9 w-auto md:h-10" />
        </Link>

        {/* Search bar — desktop */}
        <form onSubmit={handleSearch} className="hidden flex-1 items-center md:mx-8 md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search") + "..."}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2 pl-10 pr-4 text-sm transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </form>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/" className="transition-colors duration-200 hover:text-brand-primary">{t("home")}</Link>
          <Link href="/search" className="transition-colors duration-200 hover:text-brand-primary">{t("projects")}</Link>
          <LanguageSwitcher />
          <UserMenu />
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search") + "..."}
                className="w-full rounded-xl border border-gray-200 bg-white shadow-sm py-2 pl-10 pr-4 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-3 text-sm font-medium text-gray-700">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>{t("home")}</Link>
            <Link href="/search" onClick={() => setMobileMenuOpen(false)}>{t("projects")}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
