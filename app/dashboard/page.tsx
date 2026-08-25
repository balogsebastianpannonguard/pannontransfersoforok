"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Navigation, User, Phone, CheckCircle, Receipt, ArrowRight, Star, Clock, Calendar, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";

interface User {
  name: string;
  email: string;
  role: string;
}

const MOCK_TRIP = {
  id: "PT-260824-CATL",
  passenger: "Balog Sebastian Mátl",
  company: "CATL Hungary Kft.",
  phone: "+36 30 123 4567",
  from: "Budapest Liszt Ferenc Repülőtér (BUD)",
  to: "Miskolc, Déli Ipari Park (CATL)",
  date: "2026. augusztus 24.",
  time: "14:05",
  price: 128000,
  vehicle: "Mercedes-Benz V-Class (Fekete)",
  category: "Executive",
  paymentMethod: "Havi átutalás (Partner)"
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Állapotok a demóhoz: 'idle' | 'active' | 'generating' | 'receipt'
  const [tripState, setTripState] = useState<'idle' | 'active' | 'generating' | 'receipt'>('idle');

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

  const handleStartSim = () => setTripState('active');
  
  const handleComplete = () => {
    setTripState('generating');
    setTimeout(() => {
      setTripState('receipt');
    }, 2000); // 2 másodperc "generálás"
  };

  const handleReset = () => setTripState('idle');

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
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
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
      <div className="flex-1 p-4 pb-8 flex flex-col max-w-lg mx-auto w-full">
        
        {/* IDLE ÁLLAPOT */}
        {tripState === 'idle' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-900/[0.04] border border-slate-100">
              <h2 className="text-2xl font-bold text-[#0B1A2A] mb-2">Irányítópult</h2>
              <p className="text-slate-500 font-medium mb-8">
                Jelenleg nincs aktív fuvarod.
              </p>
              <button 
                onClick={handleStartSim}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Új Fuvar Szimulálása
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE ÁLLAPOT (Érkezett fuvar) */}
        {tripState === 'active' && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 space-y-6 flex-1 pt-4">
            
            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/50 border border-slate-100">
              
              <div className="flex items-center justify-between mb-8">
                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Folyamatban
                </span>
                <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Executive
                </span>
              </div>

              {/* Útvonal */}
              <div className="relative pl-6 border-l-[3px] border-slate-100 space-y-8 mb-8 ml-2">
                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-5 h-5 bg-slate-200 rounded-full border-[3px] border-white ring-4 ring-slate-50 shadow-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Felvétel • {MOCK_TRIP.time}</p>
                  <p className="text-slate-800 font-bold text-lg leading-tight">{MOCK_TRIP.from}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white ring-4 ring-blue-50 shadow-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">Leadás</p>
                  <p className="text-slate-800 font-bold text-lg leading-tight">{MOCK_TRIP.to}</p>
                </div>
              </div>

              {/* Utas kártya */}
              <div className="bg-slate-50 rounded-3xl p-4 flex items-center justify-between border border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#0B1A2A] font-black text-lg">
                    BS
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0B1A2A]">{MOCK_TRIP.passenger}</p>
                    <p className="text-xs text-blue-600 font-bold">{MOCK_TRIP.company}</p>
                  </div>
                </div>
                <button className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-100 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
              </div>

              {/* Gomb */}
              <button 
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-[#0B1A2A] to-[#1A2E44] text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Út Véglegesítése
                <ChevronRight className="w-5 h-5 opacity-70" />
              </button>

            </div>
          </div>
        )}

      </div>

      {/* GENERATING ÁLLAPOT (Overlay) */}
      {tripState === 'generating' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1A2A] p-6 animate-in fade-in duration-300">
          <Receipt className="w-16 h-16 text-[#C9A962] animate-pulse mb-8" />
          <h2 className="text-white text-xl font-black tracking-widest uppercase mb-3">E-Nyugta Generálása</h2>
          <p className="text-slate-400 text-sm font-medium text-center">Titkosított adatkapcsolat létrehozása és hitelesítés folyamatban...</p>
          <div className="w-64 h-1.5 bg-slate-800/50 rounded-full mt-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-[#C9A962] w-1/3 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}

      {/* E-NYUGTA ÁLLAPOT (Modal) */}
      {tripState === 'receipt' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
          
          <div className="bg-[#FAF8F5] rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-500">
            
            {/* Header */}
            <div className="bg-[#0B1A2A] px-6 pt-10 pb-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A962] via-yellow-200 to-[#C9A962]"></div>
              
              <div className="w-20 h-20 bg-[#1A2E44] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#0B1A2A] shadow-lg shadow-black/50 relative z-10">
                <CheckCircle className="w-10 h-10 text-[#C9A962]" />
              </div>
              
              <h3 className="text-white text-2xl font-black tracking-widest uppercase mb-1.5">Sikeres Fuvar</h3>
              <p className="text-[#C9A962] text-[10px] tracking-[0.2em] uppercase font-bold">Pannon Transfer Hitelesített E-Nyugta</p>
            </div>
            
            {/* Body */}
            <div className="px-6 py-6 bg-white relative">
              
              {/* Jagged border illusion using CSS radial gradient or just a dashed line */}
              <div className="absolute -top-3 left-0 w-full h-6 bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] bg-[length:16px_16px] -mt-3"></div>

              <div className="flex justify-between items-end border-b-2 border-slate-100 border-dashed pb-5">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Dátum</p>
                  <p className="text-sm font-bold text-[#0B1A2A]">{MOCK_TRIP.date} {MOCK_TRIP.time}</p>
                </div>
                <div className="space-y-1.5 text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Azonosító</p>
                  <p className="text-sm font-bold text-[#0B1A2A]">{MOCK_TRIP.id}</p>
                </div>
              </div>

              <div className="border-b-2 border-slate-100 border-dashed py-5 space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Utas & Cég</p>
                  <p className="text-sm font-bold text-[#0B1A2A]">{MOCK_TRIP.passenger}</p>
                  <p className="text-xs font-semibold text-slate-500">{MOCK_TRIP.company}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Útvonal</p>
                  <p className="text-sm font-bold text-[#0B1A2A] mb-1">{MOCK_TRIP.from}</p>
                  <div className="flex items-center gap-2 text-slate-400">
                    <ArrowRight className="w-3 h-3" />
                    <p className="text-sm font-bold text-slate-600">{MOCK_TRIP.to}</p>
                  </div>
                </div>
              </div>

              <div className="py-5 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-500">Szolgáltatás díja</p>
                  <p className="text-sm font-bold text-[#0B1A2A]">{MOCK_TRIP.price.toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-500">ÁFA (27%)</p>
                  <p className="text-sm font-bold text-[#0B1A2A]">{(MOCK_TRIP.price * 0.27).toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-500">Fizetési mód</p>
                  <p className="text-sm font-bold text-[#0B1A2A]">{MOCK_TRIP.paymentMethod}</p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] rounded-2xl p-5 flex justify-between items-center border border-[#E5D5B5]/30">
                <p className="text-xs font-black text-[#0B1A2A] uppercase tracking-widest">Összesen</p>
                <p className="text-2xl font-black text-[#0B1A2A]">{MOCK_TRIP.price.toLocaleString('hu-HU')} Ft</p>
              </div>

              {/* Simulated Barcode */}
              <div className="pt-6 pb-2 flex justify-center gap-[3px] opacity-30">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className={`h-10 bg-[#0B1A2A] ${Math.random() > 0.5 ? 'w-1' : 'w-[2px]'}`}></div>
                ))}
              </div>
            </div>
            
            {/* Footer action */}
            <div className="p-4 bg-white border-t border-slate-100">
              <button 
                onClick={handleReset} 
                className="w-full bg-slate-100 text-slate-700 font-bold rounded-xl py-4 hover:bg-slate-200 active:bg-slate-300 transition-colors uppercase tracking-widest text-xs"
              >
                Bezárás és visszatérés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
