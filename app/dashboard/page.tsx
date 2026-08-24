"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Nincs bejelentkezve");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#C9A962] border-t-transparent animate-spin mb-4" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
            Betöltés...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B1A2A]">Szia, {user?.name.split(" ")[0] || "Sofőr"}!</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Pannon Transfer • Sofőr Modul
          </p>
        </div>
        <button
          onClick={() => {
            document.cookie = "driver_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            router.push("/");
          }}
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-5 h-5 ml-0.5" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-900/[0.04] border border-slate-100">
          <h2 className="text-2xl font-bold text-[#0B1A2A] mb-2">Irányítópult</h2>
          <p className="text-slate-500 font-medium">
            A sofőr modul fejlesztés alatt áll. Hamarosan itt láthatod a rád bízott fuvarokat.
          </p>
        </div>
      </div>
    </div>
  );
}
