"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, ChevronRight, Lock, Mail } from "lucide-react";

export default function DriverLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Sikeres bejelentkezés
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        setError(data.error || "Hiba történt a bejelentkezés során.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Hálózati hiba. Kérjük próbálja újra.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-[#0B1A2A] rounded-b-[3rem] shadow-2xl" />
      
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-slate-900/10 border border-slate-100 p-8 sm:p-10 relative z-10">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0B1A2A] to-[#1a365d] flex items-center justify-center shadow-lg shadow-[#0B1A2A]/20 mb-6">
            <Car className="w-10 h-10 text-[#C9A962]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1A2A] tracking-tight mb-2">
            Pannon Transfer
          </h1>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <span className="text-xs font-black tracking-widest uppercase text-slate-500">
              Komplex • Sofőr Modul
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 mb-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              E-mail cím
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sofor@pannonguard.hu"
                required
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A962]/50 focus:border-[#C9A962] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Jelszó
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A962]/50 focus:border-[#C9A962] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-[#0B1A2A] hover:bg-[#11263c] text-white rounded-2xl py-4 px-6 flex items-center justify-between font-bold text-[15px] shadow-lg shadow-[#0B1A2A]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            <span>{isLoading ? "Bejelentkezés folyamatban..." : "Bejelentkezés"}</span>
            {!isLoading && (
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#C9A962]" />
              </div>
            )}
          </button>
        </form>

      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Pannon Transfer
        </p>
      </div>
    </div>
  );
}
