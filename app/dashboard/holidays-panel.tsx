"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  Printer,
  ShieldCheck,
} from "lucide-react";

interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

type LeaveType = "Fizetett szabadság" | "Betegszabadság" | "Fizetés nélküli szabadság";

export function HolidaysPanel({ user }: { user: DriverUser | null }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType>("Fizetett szabadság");
  const [reason, setReason] = useState("");

  const [documentId] = useState(() => "PT-HOL-" + new Date().getFullYear() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase());
  
  const today = new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-1 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
        
        {/* Bal oldal: Űrlap (Nyomtatáskor elrejtve) */}
        <section className="print:hidden flex flex-col gap-6">
          <div className="overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0B1A2A] via-[#10263F] to-[#0F1D31] px-6 py-8 text-white">
              <div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#C9A962]/20 blur-3xl" />
              <div className="absolute bottom-[-72px] left-[-32px] h-36 w-36 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C9A962]">
                  Pannon Transfer Zrt.
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Szabadság igénylése</h2>
                <p className="mt-2 text-sm font-medium text-slate-300">
                  Töltsd ki az adatokat, majd mentsd le a hivatalos PDF kérelmet.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Első nap</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarDays className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#C9A962] focus:bg-white focus:ring-4 focus:ring-[#C9A962]/15"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Utolsó nap</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarRange className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#C9A962] focus:bg-white focus:ring-4 focus:ring-[#C9A962]/15"
                    />
                  </div>
                </label>
              </div>

              <div>
                <span className="mb-2 block text-sm font-bold text-slate-700">Távollét típusa</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(["Fizetett szabadság", "Betegszabadság", "Fizetés nélküli szabadság"] as LeaveType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLeaveType(type)}
                      className={`rounded-2xl border px-3 py-3 text-xs font-bold transition ${
                        leaveType === type
                          ? "border-[#C9A962] bg-[#0B1A2A] text-[#F7F5F1] shadow-md shadow-[#0B1A2A]/10"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Indoklás / Megjegyzés (Opcionális)</span>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Pl.: Családi okok miatt..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C9A962] focus:bg-white focus:ring-4 focus:ring-[#C9A962]/15 resize-y"
                />
              </label>

              <button
                type="button"
                onClick={handlePrint}
                disabled={!startDate || !endDate}
                className="w-full group relative overflow-hidden flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#0B1A2A] to-[#10263F] text-white py-4 rounded-2xl text-[11px] font-black tracking-widest uppercase transition shadow-lg shadow-[#0B1A2A]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              >
                <Printer className="w-4 h-4 text-[#C9A962] group-hover:scale-110 transition-transform" />
                <span>Generálás és Mentés PDF-ként</span>
              </button>
            </div>
          </div>
        </section>

        {/* Jobb oldal: Dokumentum előnézet (Nyomtatáskor ez lesz a fő tartalom) */}
        <section className="print:fixed print:inset-0 print:m-0 print:w-full print:h-full print:z-[9999] print:bg-white print:p-8">
          <div className="h-full rounded-[30px] border border-slate-200 bg-white p-6 sm:p-10 shadow-2xl shadow-slate-900/5 print:border-none print:shadow-none print:p-0 relative overflow-hidden">
            
            {/* Vízjel */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
              <ShieldCheck className="w-[120%] h-[120%] -rotate-12 text-[#0B1A2A]" />
            </div>

            {/* Fejléc */}
            <div className="relative z-10 border-b-2 border-[#0B1A2A] pb-6 mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-black text-[#0B1A2A] tracking-tighter uppercase">Pannon Transfer</h1>
                <p className="text-[10px] font-black tracking-[0.3em] text-[#C9A962] uppercase mt-1">Hivatalos Formanyomtatvány</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Dokumentum ID</p>
                <p className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                  {documentId}
                </p>
              </div>
            </div>

            {/* Cím */}
            <div className="text-center mb-10 relative z-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest border-b-2 border-[#C9A962] inline-block pb-2">
                Szabadság Kérelem
              </h2>
            </div>

            {/* Tartalom */}
            <div className="relative z-10 space-y-6 text-sm sm:text-base text-slate-800 leading-relaxed">
              <p>
                Alulírott <strong className="text-[#0B1A2A] font-black text-lg border-b border-slate-300 pb-0.5 px-2">{user?.name || "......................................."}</strong>, mint a Pannon Guard Zrt. (Pannon Transfer) munkatársa, az alábbi időszakra vonatkozóan kérem távollétem engedélyezését:
              </p>

              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 my-8 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Távollét kezdete (Első nap):</span>
                  <span className="font-black text-lg text-[#0B1A2A]">{startDate || "ÉÉÉÉ. HH. NN."}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Távollét vége (Utolsó nap):</span>
                  <span className="font-black text-lg text-[#0B1A2A]">{endDate || "ÉÉÉÉ. HH. NN."}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Igényelt jogcím:</span>
                  <span className="font-black text-[#C9A962] bg-[#0B1A2A] px-3 py-1 rounded-lg text-sm">{leaveType}</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Indoklás / Megjegyzés:</span>
                  <span className="font-semibold text-slate-700 italic">
                    {reason || "Külön indoklás nem került megadásra."}
                  </span>
                </div>
              </div>

              <p>
                Kijelentem, hogy a fenti időszakra eső munkavégzési kötelezettségem alól felmentést kérek. Tudomásul veszem, hogy a szabadság kiadása a munkáltató jóváhagyásához kötött.
              </p>
            </div>

            {/* Aláírások */}
            <div className="relative z-10 mt-16 pt-10 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-10">
                <div className="text-center">
                  <p className="text-2xl text-[#0B1A2A] mb-2" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>
                    {user?.name}
                  </p>
                  <div className="border-t border-slate-400 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kérelmező (Munkavállaló)</p>
                  </div>
                </div>
                <div className="text-center relative">
                  <div className="h-10 mb-2 flex justify-center">
                    {/* Placeholder for manager signature, normally empty on request */}
                  </div>
                  <div className="border-t border-slate-400 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jóváhagyó (Vezető)</p>
                  </div>
                  
                  {/* Digitális bélyegző design */}
                  <div className="absolute -top-6 -right-4 md:-right-8 opacity-60 rotate-12 flex flex-col items-center">
                    <div className="border-2 border-red-600/30 rounded-full p-1">
                      <div className="border border-red-600/30 rounded-full w-16 h-16 flex items-center justify-center">
                        <span className="text-[8px] font-black text-red-600/40 uppercase tracking-tighter text-center leading-none">
                          Jóváhagyásra<br/>Vár
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <p>Kelt: {today}</p>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#C9A962]" />
                  <span>Pannon Transfer Rendszerből generálva</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
