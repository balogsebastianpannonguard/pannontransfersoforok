"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Navigation, User, Phone, CheckCircle, Receipt, ArrowRight, Star, Clock, Calendar, ShieldCheck, CreditCard, ChevronRight, X } from "lucide-react";

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
  const [isClosing, setIsClosing] = useState(false);

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

  const handleReset = () => {
    setIsClosing(true);
    setTimeout(() => {
      setTripState('idle');
      setIsClosing(false);
    }, 400); // 400ms animáció
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Sötétkék fejléc háttér */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-[#0B1A2A]"></div>
      
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#C9A962] font-bold text-xl shadow-inner backdrop-blur-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "S")}
          </div>
          <div>
            <h1 className="text-[22px] font-black text-white tracking-tight">Szia, {user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Sofőr"}!</h1>
            <p className="text-[10px] font-black text-[#C9A962] uppercase tracking-[0.2em] mt-0.5">
              Pannon Transfer • Sofőr Modul
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            document.cookie = "driver_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            router.push("/");
          }}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition active:scale-95 backdrop-blur-sm"
        >
          <LogOut className="w-5 h-5 ml-0.5" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full relative z-10">
        
        {/* IDLE ÁLLAPOT */}
        {tripState === 'idle' && (
          <div className="flex-1 flex flex-col">
            <div className="w-full bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-900/10 border border-slate-100 flex flex-col items-center text-center mt-4">
              
              <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 border border-slate-100 shadow-sm rotate-3">
                <div className="w-16 h-16 bg-[#0B1A2A] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0B1A2A]/20 -rotate-3">
                  <MapPin className="w-7 h-7 text-[#C9A962]" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-[#0B1A2A] mb-3 tracking-tight">Irányítópult</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-2">
                Jelenleg nincs aktív fuvarod a rendszerben. Készen állsz az indulásra?
              </p>
              
              <button 
                onClick={handleStartSim}
                className="w-full bg-[#0B1A2A] text-white rounded-2xl py-4.5 font-bold text-[15px] shadow-xl shadow-[#0B1A2A]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group h-[60px]"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <MapPin className="w-4 h-4 text-[#C9A962]" />
                </div>
                Új Fuvar Szimulálása
              </button>
            </div>
            
            {/* Státusz kártyák (opcionális extra design elem mobilon) */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mai fuvarok</p>
                <p className="text-xl font-black text-[#0B1A2A]">0 <span className="text-sm font-bold text-slate-400">db</span></p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Készenlét</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-[#0B1A2A]">Aktív</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE ÁLLAPOT (Érkezett fuvar) */}
        {tripState === 'active' && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 space-y-6 flex-1 mt-2">
            
            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-900/10 border border-slate-100 relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

              <div className="flex items-center justify-between mb-8 mt-2">
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
                className="w-full bg-[#0B1A2A] text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-[#0B1A2A]/20 active:scale-95 transition-all flex items-center justify-center gap-2 h-[60px]"
              >
                <span className="text-[#C9A962]">Út Véglegesítése</span>
                <ChevronRight className="w-5 h-5 text-[#C9A962] opacity-70" />
              </button>

            </div>
          </div>
        )}

      </div>

      {/* GENERATING ÁLLAPOT (Overlay) */}
      {tripState === 'generating' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1A2A] p-6 animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#C9A962] rounded-full blur-xl opacity-20 animate-pulse"></div>
            <ShieldCheck className="w-20 h-20 text-[#C9A962] relative z-10 animate-pulse" />
          </div>
          <h2 className="text-white text-xl font-black tracking-widest uppercase mb-3 text-center">NAV Hitelesítés Folyamatban</h2>
          <p className="text-slate-400 text-xs font-medium text-center max-w-xs leading-relaxed">
            Titkosított adatkapcsolat létrehozása a Számlázz.hu rendszerével és a Nemzeti Adó- és Vámhivatal szervereivel...
          </p>
          <div className="w-64 h-1 bg-slate-800/80 rounded-full mt-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#C9A962] via-yellow-200 to-[#C9A962] w-1/3 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(201,169,98,0.5)]"></div>
          </div>
          <div className="mt-8 flex items-center gap-4 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> TLS 1.3</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> NAV Online 3.0</span>
          </div>
        </div>
      )}

      {/* E-NYUGTA ÁLLAPOT (Modal) */}
      {tripState === 'receipt' && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 transition-opacity duration-400 ease-in-out ${isClosing ? 'opacity-0' : 'animate-in fade-in'}`}>
          
          <div className={`bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl shadow-black/50 relative flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-transform duration-400 ease-in-out ${isClosing ? 'translate-y-full opacity-0' : 'animate-in slide-in-from-bottom-12'}`}>
            
            {/* Vízjel / Háttér grafika */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02] flex items-center justify-center z-0">
              <ShieldCheck className="w-96 h-96 transform -rotate-12" />
            </div>

            {/* Header - Official look */}
            <div className="bg-[#0B1A2A] px-6 py-5 flex items-center justify-between relative overflow-hidden shrink-0 z-10">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A962] via-yellow-200 to-[#C9A962]"></div>
              <div>
                <h3 className="text-[#C9A962] font-black tracking-widest uppercase text-sm">Pannon Transfer</h3>
                <p className="text-slate-300 text-[8px] uppercase tracking-[0.2em] mt-1 opacity-80">E-Számla / Hitelesített Bizonylat</p>
              </div>
              <button 
                onClick={handleReset}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white opacity-80" />
              </button>
            </div>
            
            {/* Body (Görgethető) */}
            <div className="px-6 py-7 relative z-10 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Title & ID */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#0B1A2A] uppercase tracking-tighter mb-1">E-Nyugta</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Példány: Eredeti (1/1)</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Bizonylatszám</p>
                  <p className="text-xs text-[#0B1A2A] font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded shadow-inner tracking-wider">
                    {MOCK_TRIP.id}-01
                  </p>
                </div>
              </div>

              {/* Szolgáltató & Vevő rács */}
              <div className="grid grid-cols-2 gap-4 mb-6 border-y border-slate-100 py-4">
                {/* Szolgáltató */}
                <div>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-2">Szolgáltató</p>
                  <div className="space-y-1 text-[10px] text-slate-600 font-medium">
                    <p className="font-black text-[#0B1A2A] text-xs">Pannon Guard Zrt.</p>
                    <p>4025 Debrecen, Példa u. 1.</p>
                    <p>Adószám: <span className="font-mono text-[#0B1A2A]">12345678-2-41</span></p>
                    <p>Cg.: <span className="font-mono text-[#0B1A2A]">09-10-000000</span></p>
                  </div>
                </div>
                {/* Vevő */}
                <div>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-2">Vevő (Utas)</p>
                  <div className="space-y-1 text-[10px] text-slate-600 font-medium">
                    <p className="font-black text-[#0B1A2A] text-xs">{MOCK_TRIP.company}</p>
                    <p>Cím: Rendszerből importálva</p>
                    <p>Utas: <span className="text-[#0B1A2A] font-bold">{MOCK_TRIP.passenger}</span></p>
                  </div>
                </div>
              </div>

              {/* Trip Data Grid */}
              <div className="space-y-3 mb-6 text-xs bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-[10px]">Teljesítés dátuma</span>
                  <span className="font-mono text-[#0B1A2A] font-bold">{MOCK_TRIP.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-[10px]">Kiállítás dátuma</span>
                  <span className="font-mono text-[#0B1A2A] font-bold">{MOCK_TRIP.date} {MOCK_TRIP.time}:42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-[10px]">Gépjárművezető (ID)</span>
                  <span className="text-[#0B1A2A] font-bold">{user?.name || "Kovács Gábor"} (PT-402)</span>
                </div>
              </div>

              {/* Tétel táblázat */}
              <div className="mb-6">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b-2 border-[#0B1A2A] text-slate-400 uppercase tracking-widest">
                      <th className="pb-2 font-black w-1/2">Megnevezés</th>
                      <th className="pb-2 font-black text-right">ÁFA</th>
                      <th className="pb-2 font-black text-right">Bruttó (Ft)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#0B1A2A] font-semibold">
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-2">
                        Személyszállítás (Executive)
                        <div className="text-[9px] text-slate-400 mt-1 font-normal leading-tight">
                          {MOCK_TRIP.from} → {MOCK_TRIP.to}
                        </div>
                      </td>
                      <td className="py-3 text-right">27%</td>
                      <td className="py-3 text-right font-mono text-xs">{MOCK_TRIP.price.toLocaleString('hu-HU')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financials Summary */}
              <div className="flex flex-col items-end mb-8 space-y-1">
                 <div className="flex justify-between w-full max-w-[200px] text-[10px]">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Nettó összesen:</span>
                    <span className="font-mono text-[#0B1A2A] font-bold">{(MOCK_TRIP.price * 0.73).toLocaleString('hu-HU', {maximumFractionDigits:0})} Ft</span>
                 </div>
                 <div className="flex justify-between w-full max-w-[200px] text-[10px]">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">ÁFA (27%) összesen:</span>
                    <span className="font-mono text-[#0B1A2A] font-bold">{(MOCK_TRIP.price * 0.27).toLocaleString('hu-HU', {maximumFractionDigits:0})} Ft</span>
                 </div>
                 <div className="flex justify-between w-full max-w-[250px] items-end mt-2 pt-3 border-t-[3px] border-[#0B1A2A]">
                    <div>
                      <span className="block text-[#0B1A2A] font-black uppercase tracking-widest text-[11px] mb-0.5">Fizetendő Végösszeg</span>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Fizetési mód: {MOCK_TRIP.paymentMethod}</span>
                    </div>
                    <span className="font-mono text-3xl font-black text-[#0B1A2A] tracking-tighter">{MOCK_TRIP.price.toLocaleString('hu-HU')} <span className="text-lg">Ft</span></span>
                 </div>
              </div>

              {/* Barcode & Hash */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex gap-[2px] h-12 mb-3 w-full justify-center opacity-80">
                   {Array.from({ length: 50 }).map((_, i) => (
                     <div key={i} className={`bg-[#0B1A2A] ${[1,2,3,4][Math.floor(Math.random()*4)] === 1 ? 'w-2' : [1,2][Math.floor(Math.random()*2)] === 1 ? 'w-1' : 'w-[2px]'}`}></div>
                   ))}
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[11px] text-[#0B1A2A] font-mono tracking-[0.4em] font-bold">8942 0100 2342 9923 1123</p>
                  <p className="text-[7px] text-slate-400 font-mono tracking-widest break-all uppercase">
                    HASH: 9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08
                  </p>
                </div>
              </div>
              
              <div className="mt-5 text-center flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  NAV Online Számla 3.0 Hitelesített
                </div>
                <p className="text-[8px] text-slate-400 uppercase tracking-[0.1em] leading-relaxed max-w-[300px]">
                  A bizonylat a Számlázz.hu rendszerével készült. Megfelel a 2007. évi CXXVII. Áfa tv. és a 114/2007. (XII. 29.) GKM rendelet előírásainak. 
                  A bizonylat kinyomtatva és elektronikusan is hiteles.
                </p>
              </div>
            </div>
            
            {/* Footer action */}
            <button 
              onClick={handleReset} 
              className="shrink-0 w-full bg-[#0B1A2A] text-white font-bold py-6 hover:bg-[#1A2E44] transition-colors uppercase tracking-[0.25em] text-[11px] flex items-center justify-center gap-3 relative overflow-hidden group z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              Hitelesített Nyugta Bezárása
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
