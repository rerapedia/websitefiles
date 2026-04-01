"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RazorpayCheckout({
  planId,
  planName,
  isPopular,
}: {
  planId: string;
  planName: string;
  isPopular: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (!session) {
      router.push(`/auth/register?plan=${planId}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error ?? "Failed to create subscription");
        return;
      }

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        alert("Payment system not configured yet. Contact support.");
        return;
      }

      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: razorpayKeyId,
          subscription_id: data.data.razorpaySubscriptionId,
          name: "ReraPedia",
          description: `${planName} Subscription`,
          handler: async (response: Record<string, string>) => {
            await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: data.data.subscriptionId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            router.push("/dashboard/builder");
          },
          prefill: {
            email: session.user.email,
            name: session.user.name,
          },
          theme: { color: "#1e40af" },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Rzp = (window as any).Razorpay;
        const rzp = new Rzp(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`w-full rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50 ${
        isPopular
          ? "bg-brand-primary text-white hover:bg-blue-700"
          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {loading ? "Processing..." : session ? "Subscribe Now" : "Sign Up to Subscribe"}
    </button>
  );
}
