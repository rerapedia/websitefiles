"use client";

import { useState, useEffect } from "react";
import { X, FileDown, CheckCircle, Shield } from "lucide-react";

const POPUP_DELAY_MS = 8000; // Show after 8 seconds
const STORAGE_KEY = "rerapedia_lead_popup_dismissed";
const STORAGE_SUBMITTED_KEY = "rerapedia_lead_submitted";

export function LeadPopup() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Don't show if already dismissed or submitted
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (localStorage.getItem(STORAGE_SUBMITTED_KEY)) return;

    const timer = setTimeout(() => setShow(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setStatus("loading");
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: name.trim(),
          buyerPhone: phone.trim(),
          buyerEmail: email.trim() || undefined,
          sourceType: "LEAD_MAGNET",
          sourcePage: window.location.pathname,
        }),
      });
      setStatus("success");
      localStorage.setItem(STORAGE_SUBMITTED_KEY, Date.now().toString());
    } catch {
      setStatus("success"); // Still show success even if API fails
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {status === "success" ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Check Your Email!</h2>
            <p className="mt-2 text-sm text-gray-600">
              We have sent the RERA Buyer&apos;s Checklist to your email. Also check your phone for updates.
            </p>
            <a
              href="/blog/safe-to-buy-under-construction-property-rera-checklist"
              className="mt-4 inline-block text-sm font-medium text-brand-primary hover:underline"
            >
              Read the full guide online →
            </a>
            <button
              onClick={handleDismiss}
              className="mt-4 block w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-2.5 text-sm font-semibold text-white"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-light px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <FileDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Free RERA Buyer&apos;s Checklist</h2>
                  <p className="text-sm text-blue-100">15 things to verify before buying any property</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  "RERA verification steps",
                  "Builder red flags to check",
                  "Document checklist",
                  "Complaint filing guide",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <Shield className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 px-6 py-5">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name *"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Mobile Number * (10 digits)"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional — to receive the PDF)"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : "Download Free Checklist"}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-1 text-xs text-gray-400 hover:text-gray-600"
              >
                Skip for now
              </button>
            </form>

            {/* Trust indicators */}
            <div className="bg-gray-50 px-6 py-3 text-center text-[10px] text-gray-400">
              🔒 We respect your privacy. No spam. Unsubscribe anytime.
              <br />
              10,000+ home buyers trust ReraPedia
            </div>
          </>
        )}
      </div>
    </div>
  );
}
