import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { AdBanner } from "@/components/ads/ad-banner";
import { LeadPopup } from "@/components/ui/lead-popup";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ReraPedia - Check Any RERA Project's Trust Score",
    template: "%s | ReraPedia",
  },
  description:
    "India's most transparent RERA intelligence platform. Check trust scores, track construction progress, and verify builders across Haryana and Delhi.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"),
  openGraph: {
    siteName: "ReraPedia",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <AuthSessionProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <AdBanner />
              <main className="flex-1">{children}</main>
              <Footer />
              <LeadPopup />
            </div>
          </NextIntlClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
