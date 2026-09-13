"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  CalendarDays,
  CarFront,
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  Download,
  FileCheck2,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  Phone,
  RefreshCw,
  ShieldCheck,
  Stamp,
  TicketCheck,
  User2,
  X,
} from "lucide-react";
import { WaybillsPanel } from "./waybills-panel";
import { HolidaysPanel } from "./holidays-panel";

interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DriverTrip {
  _id: string;
  bookingCode: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone: string;
  companyName?: string;
  fromAddress: string;
  toAddress: string;
  pickupDate: string;
  pickupTime: string;
  travelers: number;
  luggage: number;
  paymentMethod: "card" | "bank";
  transferType: "standard" | "executive";
  assignedVehicleName?: string;
  assignedDriverName?: string;
  driverAcknowledged?: boolean;
  driverNotified?: boolean;
  price?: number;
  comment?: string;
  receipt?: {
    id: string;
    issuedAt: number;
    issuedBy: string;
    driverEmail: string;
    status: "issued";
  };
  completedAt?: number;
  status: "confirmed" | "in-progress" | "completed" | "cancelled" | "pending" | "modified";
}

interface ReceiptState {
  trip: DriverTrip;
  receiptId: string;
  issuedAt: number;
  issuedBy: string;
}

function formatHuDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatHuDateShort(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatTimestamp(ts: number) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(ts));
}

function formatMoney(value?: number) {
  if (!value) return "Egyeztetés alatt";
  return `${value.toLocaleString("hu-HU")} Ft`;
}

const BARCODE_SEGMENTS = Array.from({ length: 30 }, (_, index) => ({
  key: index,
  width: `${(index % 4) + 1}px`,
  marginRight: `${index % 3 === 0 ? 2 : 1}px`,
}));

function TripCard({
  trip,
  onAcknowledge,
  onFinalize,
  onOpenReceipt,
  acknowledgingId,
  finalizingId,
}: {
  trip: DriverTrip;
  onAcknowledge: (id: string) => void;
  onFinalize: (id: string) => void;
  onOpenReceipt: (trip: DriverTrip) => void;
  acknowledgingId: string | null;
  finalizingId: string | null;
}) {
  const isExecutive = trip.transferType === "executive";
  const initials = trip.travelerName.split(" ").slice(0, 2).map((n) => n[0]).join("");
  const [isExpanded, setIsExpanded] = useState(!trip.driverAcknowledged);
  const isFinalized = trip.status === "completed" && !!trip.receipt;
  const isPanelOpen = !isFinalized && isExpanded;

  useEffect(() => {
    if (trip.driverAcknowledged && !isFinalized) {
      const timer = setTimeout(() => setIsExpanded(false), 800);
      return () => clearTimeout(timer);
    }
  }, [trip.driverAcknowledged, isFinalized]);

  return (
    <section
      className={`relative bg-white rounded-3xl shadow-sm border overflow-hidden transition-all duration-500 ${
        !trip.driverAcknowledged
          ? "border-blue-300 shadow-blue-100/50"
          : isFinalized
            ? "border-emerald-200 shadow-none bg-slate-50/50 opacity-75 grayscale-[0.2] scale-[0.98]"
            : "border-slate-100"
      }`}
    >
      {/* Background Watermark for Finalized */}
      {isFinalized && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5">
          <Stamp className="w-64 h-64 text-emerald-900 rotate-[-15deg]" />
        </div>
      )}

      {/* PULSATING BAR FOR NEW TRIPS */}
      {!trip.driverAcknowledged && (
        <div className="bg-blue-500 text-white text-center py-2 text-[11px] font-black tracking-widest uppercase animate-pulse">
          Új fuvar kiosztva - Kérjük, igazold vissza!
        </div>
      )}
      {isFinalized && (
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white text-center py-2 text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
          <Stamp className="w-3.5 h-3.5" />
          Fuvar lezárva · Hiteles e-Nyugta kiállítva
        </div>
      )}

      <div className="p-5 sm:p-6 relative z-10">
        <div
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer group"
          onClick={() => {
            if (!isFinalized) {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <div className="flex items-start gap-4">
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                #{trip.bookingCode}
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5 group-hover:text-blue-600 transition-colors">
                {trip.pickupTime}
              </h3>
              <p className="text-[13px] font-bold text-slate-500">
                {formatHuDate(trip.pickupDate)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!trip.driverAcknowledged ? (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                <BellRing className="w-3 h-3" />
                Új kiosztás
              </span>
            ) : isFinalized ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                <Stamp className="w-3 h-3" />
                Lezárt · Nyugta
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                <CheckCircle2 className="w-3 h-3" />
                Visszaigazolva
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                isExecutive
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {isExecutive ? "Executive" : "Standard"}
            </span>
            <div className="ml-1 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:bg-slate-100 transition">
              {isPanelOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </div>
        </div>

        {isPanelOpen && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="relative pl-5 border-l-2 border-slate-200 space-y-6 mb-7 ml-2">
              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-slate-200 bg-white" />
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                  Indulás
                </p>
                <p className="text-lg font-black text-slate-900 leading-snug">
                  {trip.fromAddress}
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500" />
                <p className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-1">
                  Érkezés
                </p>
                <p className="text-lg font-black text-slate-900 leading-snug">
                  {trip.toAddress}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-700">
                    {initials}
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-slate-900">
                      {trip.travelerName}
                    </p>
                    {trip.companyName && (
                      <p className="text-[11px] font-bold text-blue-600 mt-0.5">
                        {trip.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {trip.travelerPhone}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                    <User2 className="w-4 h-4 text-slate-400" />
                    {trip.travelers} utas · {trip.luggage} csomag
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    {trip.travelerEmail}
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-y-4 gap-x-2 content-start">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    Dátum
                  </p>
                  <p className="text-[13px] font-bold text-slate-800">
                    {formatHuDate(trip.pickupDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Clock3 className="w-3 h-3" /> Indulás
                  </p>
                  <p className="text-[13px] font-bold text-slate-800">
                    {trip.pickupTime}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <CarFront className="w-3 h-3" /> Jármű
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 leading-snug">
                    {trip.assignedVehicleName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    Díjazás
                  </p>
                  <p className="text-[13px] font-bold text-slate-800">
                    {formatMoney(trip.price)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    Fizetés
                  </p>
                  <p className="text-[13px] font-bold text-slate-800">
                    {trip.paymentMethod === "card" ? "Bankkártya" : "Banki átutalás"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
                    Megjegyzés
                  </p>
                  <p className="text-[13px] font-medium text-slate-600 leading-snug">
                    {trip.comment?.trim() ? trip.comment : "Nincs megjegyzés."}
                  </p>
                </div>
              </div>
            </div>

            {!isFinalized && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={`tel:${trip.travelerPhone}`}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase hover:bg-slate-50 transition"
                  >
                    <Phone className="w-4 h-4 text-slate-400" />
                    Hívás
                  </a>
                  <button
                    onClick={() => {
                      const from = encodeURIComponent(trip.fromAddress);
                      const to = encodeURIComponent(trip.toAddress);
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}&travelmode=driving`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase hover:bg-slate-50 transition"
                  >
                    <Navigation className="w-4 h-4 text-slate-400" />
                    Útvonal
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge(trip._id);
                    }}
                    disabled={!!trip.driverAcknowledged || acknowledgingId === trip._id}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition ${
                      trip.driverAcknowledged
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#0f172a] text-white hover:bg-slate-800 shadow-md shadow-slate-900/10"
                    }`}
                  >
                    {trip.driverAcknowledged ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Már láttam
                      </>
                    ) : acknowledgingId === trip._id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Kérjük várjon...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Láttam a fuvart
                      </>
                    )}
                  </button>
                </div>

                {/* E-Nyugta / Fuvar véglegesítése szekció */}
                {trip.driverAcknowledged && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFinalize(trip._id);
                      }}
                      disabled={finalizingId === trip._id}
                      className="w-full group relative overflow-hidden flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:brightness-110 text-white py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition shadow-[0_18px_40px_-20px_rgba(59,130,246,0.9)] disabled:opacity-80"
                    >
                      {finalizingId === trip._id ? (
                        <>
                          <div className="flex items-center gap-3">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Hitelesítés folyamatban…</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-4 h-4 text-yellow-200 group-hover:scale-110 transition" />
                          <span>Fuvar lezárása · Hiteles e-Nyugta kiállítása</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {isFinalized && trip.receipt && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReceipt(trip);
                  }}
                  className="sm:col-span-3 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition"
                >
                  <TicketCheck className="w-4 h-4 text-emerald-600" />
                  E-Nyugta megtekintése · {trip.receipt.id}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: ReceiptState;
  onClose: () => void;
}) {
  const { trip, receiptId, issuedAt, issuedBy } = receipt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-[0_30px_80px_-10px_rgba(15,23,42,0.45)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Security Header */}
        <div className="shrink-0 relative bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white px-6 sm:px-8 pt-7 pb-10 overflow-hidden">
          <div className="absolute -top-20 right-[-3rem] w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-[-2rem] w-56 h-56 rounded-full bg-teal-300/20 blur-3xl" />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur">
              <Stamp className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-yellow-100 mb-0.5">
                Hiteles · Digitális nyugta
              </p>
              <h3 className="text-2xl font-black tracking-tight">Pannon Transfer</h3>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-emerald-100 mb-1">
                Nyugta sorszám
              </p>
              <p className="text-sm font-black text-white tracking-wide">{receiptId}</p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-emerald-100 mb-1">
                Kiállítva
              </p>
              <p className="text-sm font-black text-white tracking-wide">
                {formatTimestamp(issuedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Success Animation Strip */}
        <div className="shrink-0 flex items-center justify-center gap-3 py-3.5 bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-[11px] font-black tracking-widest uppercase">
          <CheckCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
          Sikeresen hitelesített fuvar · Lezárt státusz
        </div>

        {/* Receipt Body (Scrollable) */}
        <div className="px-6 sm:px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Route Section */}
          <div className="relative">
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">
              Fuvar részletek · #{trip.bookingCode}
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="relative pl-6 border-l-2 border-emerald-200 space-y-5">
                <div className="relative">
                  <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-emerald-600 mb-1">
                    Indulás · {trip.pickupTime}
                  </p>
                  <p className="text-[15px] font-black text-slate-900 leading-snug">
                    {trip.fromAddress}
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {formatHuDateShort(trip.pickupDate)}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-blue-600 mb-1">
                    Érkezés
                  </p>
                  <p className="text-[15px] font-black text-slate-900 leading-snug">
                    {trip.toAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Section */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">
              Utas és szolgáltatás
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-1">Utas</p>
                <p className="text-[15px] font-black text-slate-900 leading-tight">
                  {trip.travelerName}
                </p>
                {trip.companyName && (
                  <p className="text-xs font-bold text-blue-600 mt-0.5">
                    {trip.companyName}
                  </p>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-1">Szolgáltatás</p>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                  <p className="text-[14px] font-black text-slate-900">
                    {trip.transferType === "executive" ? "Executive" : "Standard"} osztály
                  </p>
                </div>
                <p className="text-xs font-bold text-slate-500">
                  {trip.travelers} fő · {trip.luggage} csomag
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">
              Díjazás és fizetés
            </p>
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50">
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-500 mb-0.5">Jármű</p>
                  <p className="text-[13px] font-black text-slate-900">
                    {trip.assignedVehicleName || "-"}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-500 mb-0.5">Fizetési mód</p>
                  <p className="text-[13px] font-black text-slate-900">
                    {trip.paymentMethod === "card" ? "Bankkártya" : "Banki átutalás"}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#0f172a] via-slate-800 to-[#0f172a] text-white p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-200 mb-0.5">
                    Teljes díj · Befizetve
                  </p>
                  <p className="text-xs font-bold text-slate-300">Az összeg végleges, végleges.</p>
                </div>
                <p className="text-3xl font-black tracking-tight">
                  {formatMoney(trip.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Signatures & NAV Info */}
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border-t-2 border-dashed border-slate-300 pt-3">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Kiállító aláírása
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>
                  {issuedBy}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
                  Pannon Transfer Sofőr
                </p>
              </div>
              <div className="border-t-2 border-dashed border-slate-300 pt-3 text-right">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Hitelesítő pecsét
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1">
                  <Stamp className="w-3 h-3 text-emerald-600" />
                  <p className="text-[9px] font-black tracking-widest uppercase text-emerald-700">
                    Digitálisan aláírva
                  </p>
                </div>
              </div>
            </div>

            {/* NAV Legal Text & Barcode */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-full flex items-center justify-center gap-1 mb-3 opacity-60">
                {/* Simulated Barcode */}
                {BARCODE_SEGMENTS.map((segment) => (
                  <div
                    key={segment.key}
                    className="h-8 bg-slate-800"
                    style={{
                      width: segment.width,
                      marginRight: segment.marginRight,
                    }}
                  />
                ))}
              </div>
              <p className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">
                {receiptId} • {trip._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-[8px] text-slate-400 leading-tight uppercase font-medium max-w-sm">
                Ez a bizonylat a Nemzeti Adó- és Vámhivatal (NAV) előírásainak megfelelő, zárt rendszerű elektronikus hitelesítéssel jött létre. A bizonylat utólag nem módosítható. A 2007. évi CXXVII. törvény (Áfa tv.) alapján elektronikus nyugtaként szolgál.
              </p>
            </div>
          </div>

          {trip.comment?.trim() && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-[10px] font-black tracking-widest uppercase text-blue-600 mb-1.5">
                Megjegyzés
              </p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {trip.comment}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase hover:bg-slate-100 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Nyomtatás / Mentés PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-[11px] font-black tracking-widest uppercase hover:bg-slate-800 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Rendben · Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}

function FinalizeOverlay() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm text-center">
        <div className="relative inline-block mb-10">
          {/* Outer glowing rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-[pulse_2s_ease-in-out_infinite] scale-150" />
          <div className="absolute inset-0 rounded-full bg-emerald-400/40 blur-xl animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          
          {/* Main spinner container */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(16,185,129,0.8)] overflow-hidden">
            {/* Scanning line animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent h-[200%] animate-[spin_2s_linear_infinite]" />
            
            {/* Center icon */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-10 h-10 text-white animate-[pulse_1s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>

        <h3 className="text-3xl font-black text-white tracking-tight mb-3">
          NAV Hitelesítés…
        </h3>
        
        <div className="space-y-2 mb-6">
          <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
            Titkosított kapcsolat felépítése
          </p>
          <p className="text-xs font-semibold text-slate-400 max-w-[260px] mx-auto leading-relaxed">
            Az e-Nyugta digitális aláírása és a NAV szerverek felé történő hitelesítése folyamatban van.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDuration: '0.8s' }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DriverUser | null>(null);
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [openReceipt, setOpenReceipt] = useState<ReceiptState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trips" | "waybills" | "attendance" | "holidays">("trips");

  const loadDashboard = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) throw new Error("Nincs bejelentkezve");
        const authData = await authRes.json();

        const normalizedUser: DriverUser = {
          id: authData.user.id || "",
          name: authData.user.name || "",
          email: authData.user.email || "",
          role: authData.user.role || "driver",
        };
        setUser(normalizedUser);

        const tripsRes = await fetch("/api/trips", { cache: "no-store" });
        const tripsData = await tripsRes.json().catch(() => ({}));
        if (!tripsRes.ok) {
          throw new Error(tripsData?.error || "Nem sikerült betölteni a fuvarokat");
        }

        setTrips(Array.isArray(tripsData?.trips) ? tripsData.trips : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Váratlan hiba történt";
        setError(message);
        if (message === "Nincs bejelentkezve") {
          router.push("/");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    const refreshTimer = window.setInterval(() => {
      void loadDashboard(true);
    }, 30000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadDashboard]);

  async function handleAcknowledge(tripId: string) {
    try {
      setAcknowledgingId(tripId);
      const res = await fetch(`/api/trips/${tripId}/acknowledge`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.trip) {
        throw new Error(data?.error || "A visszaigazolás nem sikerült");
      }

      setTrips((current) =>
        current.map((trip) =>
          trip._id === tripId ? { ...trip, driverAcknowledged: true } : trip
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "A visszaigazolás nem sikerült");
    } finally {
      setAcknowledgingId(null);
    }
  }

  async function handleFinalize(tripId: string) {
    try {
      setFinalizingId(tripId);
      // Wait for the animation to play out nicely
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await fetch(`/api/trips/${tripId}/finalize`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.trip) {
        throw new Error(data?.error || "A nyugta kiállítása sikertelen");
      }

      const completedTrip: DriverTrip = data.trip;
      setTrips((current) =>
        current.map((trip) => (trip._id === tripId ? completedTrip : trip))
      );
      setOpenReceipt({
        trip: completedTrip,
        receiptId: data.receipt.id,
        issuedAt: data.receipt.issuedAt,
        issuedBy: data.receipt.issuedBy,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "A nyugta kiállítása sikertelen");
    } finally {
      setFinalizingId(null);
    }
  }

  const acknowledgedCount = useMemo(
    () => trips.filter((trip) => trip.driverAcknowledged).length,
    [trips]
  );

  const completedCount = useMemo(
    () => trips.filter((trip) => trip.status === "completed" && !!trip.receipt).length,
    [trips]
  );

  let mainContent;

  if (activeTab === "trips") {
    mainContent = (
      <>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
              Kiküldött utak
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {trips.length}
              <span className="text-sm text-slate-400 font-bold ml-1">db</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
              Visszaigazolva
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {acknowledgedCount}
              <span className="text-sm text-slate-400 font-bold ml-1">db</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-100">
            <p className="text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-2 flex items-center gap-1">
              <Stamp className="w-3 h-3" /> Lezárt
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700">
              {completedCount}
              <span className="text-sm text-emerald-400 font-bold ml-1">db</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Kiosztott utak
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Itt látod azokat a fuvarokat, amelyeket a diszpécser neked küldött ki.
            </p>
          </div>
          <button
            onClick={() => loadDashboard(true)}
            disabled={isRefreshing}
            className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-[11px] font-black tracking-widest uppercase text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Frissítés
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
            {error}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mx-auto flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">
              Nincs kiosztott fuvard
            </h3>
            <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
              Jelenleg nem találtunk számodra aktív utat a rendszerben. Kérjük, nézz vissza
              később!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onAcknowledge={handleAcknowledge}
                onFinalize={handleFinalize}
                onOpenReceipt={(t) =>
                  t.receipt &&
                  setOpenReceipt({
                    trip: t,
                    receiptId: t.receipt.id,
                    issuedAt: t.receipt.issuedAt,
                    issuedBy: t.receipt.issuedBy,
                  })
                }
                acknowledgingId={acknowledgingId}
                finalizingId={finalizingId}
              />
            ))}
          </div>
        )}
      </>
    );
  } else if (activeTab === "waybills") {
    mainContent = <WaybillsPanel user={user} />;
  } else if (activeTab === "holidays") {
    mainContent = <HolidaysPanel user={user} />;
  } else if (activeTab === "attendance") {
    mainContent = (
      <div className="group relative overflow-hidden rounded-[30px] border border-slate-100 bg-white p-10 text-center shadow-sm transition hover:shadow-xl mt-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1A2A] to-[#10263F] opacity-0 transition duration-500 group-hover:opacity-100" />
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#C9A962]/20 blur-3xl transition duration-500 group-hover:bg-[#C9A962]/40" />
        
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 transition duration-500 group-hover:bg-white/10 group-hover:border-white/20">
            <Clock3 className="h-8 w-8 text-slate-400 transition duration-500 group-hover:text-[#C9A962]" />
          </div>
          <h3 className="mb-3 text-2xl font-black text-slate-800 transition duration-500 group-hover:text-white">
            Pannon Transfer Jelenléti Ív
          </h3>
          <p className="mx-auto mb-8 max-w-sm text-sm font-medium text-slate-500 transition duration-500 group-hover:text-slate-300">
            A hivatalos jelenléti ív kitöltéséhez és kezeléséhez kérjük, látogass el a dedikált felületünkre.
          </p>
          <a
            href="https://pannontransferjelenletiiv.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0B1A2A] px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition duration-500 hover:scale-105 group-hover:bg-[#C9A962] group-hover:text-[#0B1A2A] group-hover:shadow-[#C9A962]/30"
          >
            Tovább a Jelenléti ívhez
          </a>
        </div>
      </div>
    );
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
            Betöltés…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-800 font-sans pb-20">
      {finalizingId && <FinalizeOverlay />}
      {openReceipt && (
        <ReceiptModal receipt={openReceipt} onClose={() => setOpenReceipt(null)} />
      )}

      {/* Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-[#111827] h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col border-r border-white/10">
            <div className="p-6 pb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] text-[#C9A962] uppercase">
                    Pannon Transfer
                  </p>
                  <p className="text-xl font-black text-white mt-0.5">Sofőr Modul</p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#C9A962] text-slate-900 flex items-center justify-center font-black text-lg">
                  {user?.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
              <button
                onClick={() => {
                  setActiveTab("trips");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "trips"
                    ? "bg-[#C9A962] text-[#111827] shadow-lg shadow-[#C9A962]/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <MapPin className={`w-5 h-5 ${activeTab === "trips" ? "text-[#111827]" : "text-slate-400"}`} />
                Kiosztott utak
              </button>

              <button
                onClick={() => {
                  setActiveTab("waybills");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "waybills"
                    ? "bg-[#C9A962] text-[#111827] shadow-lg shadow-[#C9A962]/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FileCheck2 className={`w-5 h-5 ${activeTab === "waybills" ? "text-[#111827]" : "text-slate-400"}`} />
                Menetlevelek
              </button>

              <button
                onClick={() => {
                  setActiveTab("attendance");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "attendance"
                    ? "bg-[#C9A962] text-[#111827] shadow-lg shadow-[#C9A962]/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Clock3 className={`w-5 h-5 ${activeTab === "attendance" ? "text-[#111827]" : "text-slate-400"}`} />
                Jelenléti ívek
              </button>

              <button
                onClick={() => {
                  setActiveTab("holidays");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "holidays"
                    ? "bg-[#C9A962] text-[#111827] shadow-lg shadow-[#C9A962]/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <CalendarDays className={`w-5 h-5 ${activeTab === "holidays" ? "text-[#111827]" : "text-slate-400"}`} />
                Szabadság kérelmek
              </button>
            </nav>

            <div className="p-6 border-t border-white/10 mt-auto">
              <button
                onClick={() => {
                  document.cookie =
                    "driver_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                  router.push("/");
                }}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition"
              >
                <LogOut className="w-4 h-4" />
                Kijelentkezés
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#111827] text-white pt-6 pb-20 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#C9A962] text-slate-900 flex items-center justify-center font-black text-lg ml-1">
              {user?.name?.charAt(0).toUpperCase() || "S"}
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-[#C9A962] uppercase">
                Pannon Transfer · Sofőr Modul
              </p>
              <p className="text-sm font-bold text-white mt-0.5">{user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              document.cookie =
                "driver_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              router.push("/");
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 -mt-12 relative z-10">
        {mainContent}
      </main>
    </div>
  );
}
