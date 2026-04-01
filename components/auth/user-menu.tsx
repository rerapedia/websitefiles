"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, Heart, LogOut } from "lucide-react";
import { useState } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") return null;

  if (!session) {
    return (
      <Link
        href="/auth/login"
        className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Log In
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{session.user.name ?? "Account"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] bg-white py-1 shadow-lg">
            <Link
              href="/dashboard/saved"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Heart className="h-4 w-4" />
              Saved Projects
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
