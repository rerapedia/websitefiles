import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
        <h1 className="text-center text-2xl font-extrabold text-gray-900">Create Your Account</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join ReraPedia to track RERA projects and builders
        </p>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
