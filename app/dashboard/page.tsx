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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-500 border border-slate-200">
            
            {/* Header - Official look */}
            <div className="bg-[#0B1A2A] px-6 py-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C9A962]"></div>
              <div>
                <h3 className="text-[#C9A962] font-black tracking-widest uppercase text-sm">Pannon Transfer</h3>
                <p className="text-slate-300 text-[9px] uppercase tracking-widest mt-0.5">Hitelesített E-Bizonylat</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#C9A962]/30 flex items-center justify-center bg-[#1A2E44] shadow-inner">
                <ShieldCheck className="w-5 h-5 text-[#C9A962]" />
              </div>
            </div>
            
            {/* Body */}
            <div className="px-6 py-6">
              
              {/* Title & ID */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-[#0B1A2A] uppercase tracking-widest mb-2">E-Nyugta</h2>
                <p className="text-xs text-slate-600 font-mono bg-slate-100 border border-slate-200 inline-block px-2.5 py-1 rounded">Bizonylatszám: {MOCK_TRIP.id}-01</p>
              </div>

              {/* Official Company Data */}
              <div className="text-[9px] text-slate-500 text-center mb-6 uppercase tracking-widest border-b border-slate-100 pb-5 space-y-1">
                <p className="font-bold text-slate-700">Szolgáltató: Pannon Guard Zrt.</p>
                <p>Adószám: 12345678-2-41</p>
                <p>4025 Debrecen, Példa utca 1.</p>
              </div>

              {/* Trip Data Grid */}
              <div className="space-y-3 mb-6 text-xs border-b border-slate-100 pb-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Kiállítás dátuma</span>
                  <span className="font-mono text-[#0B1A2A] font-semibold">{MOCK_TRIP.date} {MOCK_TRIP.time}:42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Gépjárművezető</span>
                  <span className="text-[#0B1A2A] font-semibold">{user?.name || "Kovács Gábor"} (ID: PT-402)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Utas neve</span>
                  <span className="text-[#0B1A2A] font-semibold">{MOCK_TRIP.passenger}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Partnercég</span>
                  <span className="text-[#0B1A2A] font-semibold">{MOCK_TRIP.company}</span>
                </div>
              </div>

              {/* Route */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">Teljesített Útvonal</p>
                <div className="flex flex-col gap-2 text-xs font-semibold text-[#0B1A2A]">
                  <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {MOCK_TRIP.from}</p>
                  <div className="w-0.5 h-3 bg-slate-200 ml-[2.5px] -my-1"></div>
                  <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span> {MOCK_TRIP.to}</p>
                </div>
              </div>

              {/* Financials */}
              <div className="space-y-2 mb-8">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Nettó szolgáltatási díj</span>
                    <span className="font-mono text-[#0B1A2A]">{(MOCK_TRIP.price * 0.73).toLocaleString('hu-HU', {maximumFractionDigits:0})} Ft</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ÁFA (27%)</span>
                    <span className="font-mono text-[#0B1A2A]">{(MOCK_TRIP.price * 0.27).toLocaleString('hu-HU', {maximumFractionDigits:0})} Ft</span>
                 </div>
                 <div className="flex justify-between items-end mt-4 pt-4 border-t-[3px] border-[#0B1A2A]">
                    <div>
                      <span className="block text-[#0B1A2A] font-black uppercase tracking-widest text-[10px] mb-1">Végösszeg</span>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest">Fizetési mód: {MOCK_TRIP.paymentMethod}</span>
                    </div>
                    <span className="font-mono text-2xl font-black text-[#0B1A2A]">{MOCK_TRIP.price.toLocaleString('hu-HU')} Ft</span>
                 </div>
              </div>

              {/* Barcode */}
              <div className="flex flex-col items-center justify-center opacity-80">
                <div className="flex gap-[2px] h-10 mb-2 w-full justify-center">
                   {Array.from({ length: 45 }).map((_, i) => (
                     <div key={i} className={`bg-[#0B1A2A] ${[1,2,3][Math.floor(Math.random()*3)] === 1 ? 'w-1.5' : 'w-[2px]'}`}></div>
                   ))}
                </div>
                <p className="text-[10px] text-[#0B1A2A] font-mono tracking-[0.3em]">0100 2342 9923 1123</p>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-[8px] text-slate-400 uppercase tracking-[0.1em] leading-relaxed max-w-[280px] mx-auto">
                  Ez a dokumentum elektronikusan hitelesített. <br/>A bizonylat megfelel a 2007. évi CXXVII. Áfa tv. előírásainak.
                </p>
              </div>
            </div>
            
            {/* Footer action */}
            <button 
              onClick={handleReset} 
              className="w-full bg-[#0B1A2A] text-white font-bold py-5 hover:bg-[#1A2E44] transition-colors uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2"
            >
              Nyugta Bezárása
              <ArrowRight className="w-3 h-3 opacity-50" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
