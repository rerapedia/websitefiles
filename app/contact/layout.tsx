import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | ReraPedia",
  description: "Contact ReraPedia for RERA data queries, builder profile claims, advertising, or partnership opportunities. We respond within 24 hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact ReraPedia",
    description: "Get in touch with the ReraPedia team.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
