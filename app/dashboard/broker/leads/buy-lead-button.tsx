"use client";

import { useState } from "react";
import { formatPaise } from "@/lib/utils/format";

export function BuyLeadButton({ leadId, price }: { leadId: string; price: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "purchased">("idle");
  const [contact, setContact] = useState<{ name: string; phone: string; email: string | null } | null>(null);

  async function handleBuy() {
    setStatus("loading");
    try {
      const res = await fetch("/api/broker/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("purchased");
        setContact({
          name: data.data.buyerName,
          phone: data.data.buyerPhone,
          email: data.data.buyerEmail,
        });
      } else {
        alert(data.error ?? "Purchase failed");
        setStatus("idle");
      }
    } catch {
      alert("Network error");
      setStatus("idle");
    }
  }

  if (status === "purchased" && contact) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <p className="text-sm font-medium text-green-800">Lead Purchased!</p>
        <p className="mt-1 text-sm"><strong>Name:</strong> {contact.name}</p>
        <p className="text-sm"><strong>Phone:</strong> {contact.phone}</p>
        {contact.email && <p className="text-sm"><strong>Email:</strong> {contact.email}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={handleBuy}
      disabled={status === "loading"}
      className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {status === "loading" ? "Processing..." : `Buy Lead — ${formatPaise(price)}`}
    </button>
  );
}
