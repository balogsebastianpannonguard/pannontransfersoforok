"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Akkor jelenik meg, ha a "/" oldalt érvényes ?token= egyedi belépő linkkel nyitják meg.
 * Automatikusan bejelentkeztet és átirányít - nincs form, nem kell rákattintani semmire.
 * Hiba esetén visszaesik a normál bejelentkező űrlapra.
 */
export default function DirectLoginRedirect({ token }: { token: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/direct-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (!cancelled && res.ok && json?.success) {
          window.location.href = "/dashboard";
          return;
        }
      } catch {
        // ignore, fall through to failed state below
      }
      if (!cancelled) setFailed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (failed) {
      window.location.href = "/";
    }
  }, [failed]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[#C9A962] animate-spin" />
        <p className="text-[13px] text-slate-400 font-medium tracking-wide">
          Bejelentkezés...
        </p>
      </div>
    </div>
  );
}
