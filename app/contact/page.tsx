"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // In production, POST to /api/contact
    setTimeout(() => setStatus("sent"), 1000);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-center text-3xl font-extrabold text-gray-900">Contact Us</h1>
      <p className="mt-2 text-center text-gray-600">Have a question? We would love to hear from you.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-brand-primary to-brand-light p-6 text-white">
            <h2 className="text-xl font-bold">Get in Touch</h2>
            <p className="mt-2 text-sm text-blue-100">We typically respond within 24 hours.</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-200" />
                <span>support@rerapedia.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-200" />
                <span>+91 (coming soon)</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-200" />
                <span>Gurugram, Haryana, India</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <h3 className="font-semibold text-gray-900">For Builders</h3>
            <p className="mt-1 text-sm text-gray-600">Want to claim your profile or advertise? Email builders@rerapedia.com</p>
            <h3 className="mt-4 font-semibold text-gray-900">For Media</h3>
            <p className="mt-1 text-sm text-gray-600">Press inquiries: press@rerapedia.com</p>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          {status === "sent" ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Message Sent!</h3>
              <p className="mt-1 text-sm text-gray-600">We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input type="text" value={form.subject} onChange={(e) => update("subject", e.target.value)} required className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea value={form.message} onChange={(e) => update("message", e.target.value)} required rows={5} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
              </div>
              <button type="submit" disabled={status === "sending"} className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50">
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
