"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Hiányzó meghívó token.");
      setLoading(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/setup-password/validate?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data.valid) {
          setEmail(data.email);
        } else {
          setError(data.message || "Érvénytelen token.");
        }
      } catch (err) {
        setError("Hiba történt a token ellenőrzésekor.");
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("A két jelszó nem egyezik meg.");
      return;
    }
    if (password.length < 8) {
      setError("A jelszónak legalább 8 karakter hosszúnak kell lennie.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(data.error || "Hiba történt a jelszó beállításakor.");
      }
    } catch (err) {
      setError("Hálózati hiba történt.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#C9A962] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-900/[0.04] max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-bold text-[#0B1A2A] mb-3">Érvénytelen link</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-[#0B1A2A] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all uppercase tracking-wider text-sm"
          >
            Vissza a bejelentkezéshez
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-900/[0.04] max-w-md w-full text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h2 className="text-2xl font-black text-[#0B1A2A] mb-3">Sikeres aktiválás!</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-6">A jelszavadat biztonságosan elmentettük. Rendszerünk most automatikusan átirányít a bejelentkezéshez...</p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[progress_3s_ease-in-out_forwards]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Sötétkék felső sáv - teljesen megegyező a bejelentkezésivel */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-[#0B1A2A]"></div>
      
      <div className="w-full max-w-md relative z-10 mt-8">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 p-8 border border-slate-100 flex flex-col items-center">
          
          {/* Ikon és Címek - Középre igazítva, bejelentkezőhöz hasonló stílus */}
          <div className="w-16 h-16 bg-[#0B1A2A] rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-[#0B1A2A]/20">
            <span className="text-[#C9A962] text-2xl font-bold">PT</span>
          </div>
          
          <h1 className="text-[28px] font-black text-[#0B1A2A] tracking-tight mb-2 text-center">Pannon Transfer</h1>
          <div className="bg-slate-100 px-4 py-1.5 rounded-full mb-8">
             <span className="text-[#0B1A2A] text-[10px] font-black uppercase tracking-[0.2em]">Komplex • Sofőr Modul</span>
          </div>

          <div className="w-full text-left mb-6">
            <h2 className="text-xl font-bold text-[#0B1A2A] mb-1">Szia, {(email || "").split("@")[0]}!</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Kérlek, állítsd be az új jelszavadat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail cím</label>
                <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  {email || "Töltés..."}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Új jelszó</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0B1A2A] focus:ring-4 focus:ring-[#0B1A2A]/5 transition-all text-[#0B1A2A] font-medium outline-none placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Jelszó megerősítése</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0B1A2A] focus:ring-4 focus:ring-[#0B1A2A]/5 transition-all text-[#0B1A2A] font-medium outline-none placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 flex items-start gap-2">
                <span className="text-rose-500 shrink-0">!</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !password || !confirmPassword}
              className="w-full py-4 px-6 bg-[#0B1A2A] text-white font-bold rounded-xl shadow-lg hover:bg-[#132842] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all text-sm flex items-center justify-between mt-6"
            >
              {submitting ? (
                <span className="w-full text-center flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Mentés...
                </span>
              ) : (
                <>
                  <span>Jelszó Mentése</span>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-8">
          © {new Date().getFullYear()} PANNON TRANSFER
        </p>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#0B1A2A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SetupPasswordForm />
    </Suspense>
  );
}
