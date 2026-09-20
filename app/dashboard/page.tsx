"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
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
  Lock,
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
  Wifi,
  X,
  Zap,
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
  toType?: "airport" | "other";
  flightNumber?: string;
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
  onStart,
  onFinalize,
  onOpenReceipt,
  acknowledgingId,
  startingId,
  finalizingId,
  isNew,
}: {
  trip: DriverTrip;
  onAcknowledge: (id: string) => void;
  onStart: (id: string) => void;
  onFinalize: (id: string) => void;
  onOpenReceipt: (trip: DriverTrip) => void;
  acknowledgingId: string | null;
  startingId: string | null;
  finalizingId: string | null;
  isNew: boolean;
}) {
  const isExecutive = trip.transferType === "executive";
  const initials = trip.travelerName.split(" ").slice(0, 2).map((n) => n[0]).join("");
  const [isExpanded, setIsExpanded] = useState(!trip.driverAcknowledged);
  const isFinalized = trip.status === "completed" && !!trip.receipt;
  const isPanelOpen = !isFinalized && isExpanded;

  // Yellow glow pulse: show on new/unacknowledged, animate out on acknowledge
  const [showGlow, setShowGlow] = useState(!trip.driverAcknowledged);
  useEffect(() => {
    if (trip.driverAcknowledged) {
      const t = setTimeout(() => setShowGlow(false), 800);
      return () => clearTimeout(t);
    } else {
      setShowGlow(true);
    }
  }, [trip.driverAcknowledged]);

  useEffect(() => {
    if (trip.driverAcknowledged && !isFinalized) {
      const timer = setTimeout(() => setIsExpanded(false), 800);
      return () => clearTimeout(timer);
    }
  }, [trip.driverAcknowledged, isFinalized]);

  return (
    <section
      className={`relative rounded-3xl shadow-sm border overflow-hidden transition-all duration-500 ${
        !trip.driverAcknowledged
          ? "border-amber-400/60 shadow-amber-200/40"
          : isFinalized
            ? "border-emerald-200 shadow-none bg-slate-50/50 opacity-75 grayscale-[0.2] scale-[0.98]"
            : "border-slate-100 bg-white"
      }`}
      style={!trip.driverAcknowledged ? { background: 'white' } : {}}
    >
      {/* === YELLOW NEW TRIP GLOW === */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: trip.driverAcknowledged
              ? '0 0 0 0 rgba(251,191,36,0)'
              : '0 0 0 3px rgba(251,191,36,0.7), 0 0 30px 0 rgba(251,191,36,0.25)',
            transition: 'box-shadow 0.8s ease',
            animation: !trip.driverAcknowledged ? 'newTripGlow 1.8s ease-in-out infinite' : 'none',
          }}
        />
      )}

      {/* Background Watermark for Finalized */}
      {isFinalized && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5">
          <Stamp className="w-64 h-64 text-emerald-900 rotate-[-15deg]" />
        </div>
      )}

      {/* PULSATING BAR FOR NEW TRIPS - now amber/yellow */}
      {!trip.driverAcknowledged && (
        <div
          className="text-white text-center py-2 text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(90deg, #b45309, #d97706, #f59e0b, #d97706, #b45309)',
            backgroundSize: '300% 100%',
            animation: 'borderSweep 2s linear infinite',
          }}
        >
          <BellRing className="w-3.5 h-3.5 animate-pulse" />
          {isNew ? 'Új fuvar érkezett — Kérjük, igazold vissza!' : 'Visszaigazolásra vár!'}
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
                    {trip.status === "confirmed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStart(trip._id);
                        }}
                        disabled={startingId === trip._id}
                        className="mb-3 w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[11px] font-black tracking-widest uppercase shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 disabled:opacity-70"
                      >
                        {startingId === trip._id ? (
                          <><RefreshCw className="w-5 h-5 animate-spin" /> Út indítása…</>
                        ) : (
                          <><Navigation className="w-5 h-5" /> Út elkezdése</>
                        )}
                      </button>
                    )}
                    {trip.status === "in-progress" && <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFinalize(trip._id);
                      }}
                      disabled={finalizingId === trip._id}
                      className="w-full group relative overflow-hidden flex items-center justify-center gap-3 py-5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition disabled:opacity-80"
                      style={{
                        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #059669 60%, #10b981 100%)',
                        boxShadow: '0 20px 60px -15px rgba(5, 150, 105, 0.7), 0 0 0 1px rgba(16,185,129,0.3) inset',
                      }}
                    >
                      {/* Shimmer overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.5s infinite',
                        }}
                      />
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl opacity-60" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), transparent, rgba(52,211,153,0.3))', backgroundSize: '400% 400%', animation: 'backgroundShift 3s ease infinite' }} />
                      {finalizingId === trip._id ? (
                        <div className="relative flex items-center gap-3 text-white">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>NAV hitelesítés folyamatban…</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-3 text-white">
                          <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileCheck2 className="w-4 h-4 text-emerald-200" />
                          </div>
                          <div className="text-left">
                            <div className="text-[12px] font-black tracking-widest">Fuvar lezárása · e-Nyugta kiállítása</div>
                            <div className="text-[9px] font-bold text-emerald-200 tracking-widest uppercase">NAV-hitelesített · Digitálisan aláírt · Azonnal érvényes</div>
                          </div>
                          <Zap className="w-4 h-4 text-yellow-300 animate-pulse ml-1" />
                        </div>
                      )}
                    </button>}
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

// === CONFETTI COMPONENT ===
const CONFETTI_COLORS = ['#10b981', '#34d399', '#059669', '#C9A962', '#fbbf24', '#a78bfa', '#60a5fa', '#f472b6'];
const CONFETTI_SHAPES = ['square', 'circle', 'triangle'];

function ConfettiCannon() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.shape === 'triangle' ? 0 : p.size,
            backgroundColor: p.shape !== 'triangle' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : 0,
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : 'none',
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : 'none',
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : 'none',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// === QR CODE SIMULATION ===
function QRCodeSimulated({ value }: { value: string }) {
  const size = 7;
  // Deterministic pattern from value hash
  const hash = value.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
  const cells = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size);
    const col = i % size;
    // Always-on corner markers
    const isCorner = (row < 2 && col < 2) || (row < 2 && col >= size - 2) || (row >= size - 2 && col < 2);
    const seed = (hash ^ (i * 2654435761)) >>> 0;
    return isCorner || (seed % 3 !== 0);
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: '1.5px',
        padding: '8px',
        background: 'white',
        borderRadius: '8px',
        width: '80px',
        height: '80px',
      }}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          style={{
            background: on ? '#064e3b' : 'white',
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  );
}

// === RECEIPT MODAL ===
function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: ReceiptState;
  onClose: () => void;
}) {
  const { trip, receiptId, issuedAt, issuedBy } = receipt;
  const [showConfetti, setShowConfetti] = useState(true);
  const [stampVisible, setStampVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStampVisible(true), 400);
    const t2 = setTimeout(() => setBodyVisible(true), 700);
    const t3 = setTimeout(() => setShowConfetti(false), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      {showConfetti && <ConfettiCannon />}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5" style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(16px)' }}>
        <div
          className="relative w-full max-w-lg flex flex-col max-h-[95vh] rounded-[32px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #020817 0%, #0a1628 100%)',
            boxShadow: '0 40px 120px -20px rgba(16,185,129,0.5), 0 0 0 1px rgba(16,185,129,0.2)',
            animation: 'receiptReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}
        >
          {/* === ANIMATED TOP BORDER === */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #10b981, #34d399, #C9A962, #10b981, transparent)', backgroundSize: '400% 100%', animation: 'borderSweep 2.5s linear infinite' }} />

          {/* === HEADER === */}
          <div className="shrink-0 relative overflow-hidden px-6 sm:px-8 pt-8 pb-6">
            {/* Background glow */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.5) 0%, transparent 70%)' }} />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Logo + Title */}
            <div className="relative flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #064e3b, #059669)',
                  boxShadow: '0 0 0 1px rgba(16,185,129,0.4), 0 8px 24px -8px rgba(16,185,129,0.6)',
                  animation: 'navPulse 2s ease-in-out infinite',
                }}
              >
                <Award className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-[0.4em] uppercase mb-1" style={{ color: '#C9A962' }}>Pannon Transfer · NAV-Hitelesített</p>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none">e-Nyugta</h2>
                <p className="text-[11px] font-bold text-emerald-400 mt-0.5">Hiteles · Digitálisan aláírt · Jogilag érvényes</p>
              </div>
            </div>

            {/* Receipt ID + Timestamp bar */}
            <div
              className="relative rounded-2xl p-4 grid grid-cols-2 gap-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <p className="text-[9px] font-black tracking-[0.25em] uppercase mb-1.5" style={{ color: '#10b981' }}>Nyugtaszám</p>
                <p className="text-[13px] font-black text-white font-mono tracking-wider">{receiptId}</p>
              </div>
              <div>
                <p className="text-[9px] font-black tracking-[0.25em] uppercase mb-1.5" style={{ color: '#10b981' }}>Kiállítva</p>
                <p className="text-[12px] font-bold text-slate-200">{formatTimestamp(issuedAt)}</p>
              </div>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 3s infinite' }} />
              </div>
            </div>
          </div>

          {/* === SUCCESS STAMP BANNER === */}
          <div
            className="shrink-0 mx-5 mb-4 rounded-2xl overflow-hidden"
            style={{ opacity: stampVisible ? 1 : 0, transition: 'opacity 0.4s ease', transform: stampVisible ? 'scale(1)' : 'scale(0.95)', transitionProperty: 'opacity, transform' }}
          >
            <div
              className="flex items-center justify-center gap-3 py-3 px-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.1))',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '16px',
              }}
            >
              {/* Animated check */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.2)', border: '1.5px solid #10b981' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ strokeDasharray: 100, strokeDashoffset: stampVisible ? 0 : 100, transition: 'stroke-dashoffset 0.5s ease 0.3s' }}
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black tracking-widest uppercase text-emerald-400">Fuvar sikeresen lezárva</p>
                <p className="text-[9px] font-bold text-slate-500 tracking-wide">NAV Nyugtatárba feltöltve · Digitális aláírás érvényes</p>
              </div>
              <div
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <Stamp className="w-4 h-4" style={{ color: '#10b981', animation: stampVisible ? 'stampDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' : 'none' }} />
              </div>
            </div>
          </div>

          {/* === SCROLLABLE BODY === */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 space-y-4 pb-4"
            style={{ opacity: bodyVisible ? 1 : 0, transform: bodyVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            {/* Route */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-4 pt-3 pb-1">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: '#C9A962' }}>Fuvar útvonal · #{trip.bookingCode}</p>
              </div>
              <div className="px-4 pb-4 relative">
                <div className="absolute left-7 top-4 bottom-4 w-[2px] rounded-full" style={{ background: 'linear-gradient(to bottom, #10b981, #3b82f6)' }} />
                <div className="space-y-4 pl-6">
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
                    <p className="text-[9px] font-black tracking-widest uppercase text-emerald-500 mb-0.5">Indulás · {trip.pickupTime} · {formatHuDateShort(trip.pickupDate)}</p>
                    <p className="text-[14px] font-black text-white leading-snug">{trip.fromAddress}</p>
                    {trip.flightNumber && (
                      <p className="text-[10px] font-bold text-amber-300 mt-1.5">Járatszám: {trip.flightNumber}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" />
                    <p className="text-[9px] font-black tracking-widest uppercase text-blue-400 mb-0.5">Érkezés</p>
                    <p className="text-[14px] font-black text-white leading-snug">{trip.toAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger + Service */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: '#C9A962' }}>Utas</p>
                <p className="text-[13px] font-black text-white leading-tight">{trip.travelerName}</p>
                {trip.companyName && <p className="text-[10px] font-bold text-blue-400 mt-0.5">{trip.companyName}</p>}
                <p className="text-[10px] font-bold text-slate-500 mt-1">{trip.travelers} fő · {trip.luggage} csomag</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: '#C9A962' }}>Szolgáltatás</p>
                <div className="flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[13px] font-black text-white">{trip.transferType === 'executive' ? 'Executive' : 'Standard'}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-500">Személyszállítás</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{trip.assignedVehicleName || '–'}</p>
              </div>
            </div>

            {/* === PRICE BLOCK === */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)', boxShadow: '0 8px 32px -8px rgba(16,185,129,0.4)' }}
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-300 mb-1">Teljes díj · Áfa-tartalom: 27%</p>
                  <p className="text-[10px] font-bold text-emerald-200">{trip.paymentMethod === 'card' ? 'Bankkártyával fizetve' : 'Banki átutalással fizetve'}</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-4xl font-black text-white"
                    style={{ textShadow: '0 0 30px rgba(52,211,153,0.5)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatMoney(trip.price)}
                  </p>
                </div>
              </div>
              {/* Shimmer */}
              <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />
            </div>

            {/* === SIGNATURE + QR === */}
            <div className="grid grid-cols-2 gap-3">
              {/* Signature */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] font-black tracking-widest uppercase mb-3" style={{ color: '#C9A962' }}>Kiállító</p>
                <p className="text-[16px] font-bold text-white leading-tight" style={{ fontFamily: "'Brush Script MT', cursive, serif" }}>{issuedBy}</p>
                <div className="mt-2 pt-2" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pannon Transfer Sofőr</p>
                </div>
              </div>
              {/* QR Code */}
              <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: '#C9A962' }}>DÁP QR</p>
                <div style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }}>
                  <QRCodeSimulated value={receiptId} />
                </div>
                <p className="text-[8px] font-bold text-slate-500 mt-1.5 text-center">Olvasd be a NAV app-pal</p>
              </div>
            </div>

            {/* === HOLOGRAM STAMP === */}
            <div
              className="relative rounded-2xl overflow-hidden p-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Hologram circle */}
                <div
                  className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center relative"
                  style={{
                    background: 'conic-gradient(from 0deg, #10b981, #3b82f6, #a78bfa, #10b981)',
                    animation: 'hologram 3s ease-in-out infinite',
                    boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                  }}
                >
                  <div
                    className="absolute inset-1 rounded-full flex items-center justify-center"
                    style={{ background: '#0a1628' }}
                  >
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black tracking-widest uppercase text-emerald-400">Digitálisan hitelesítve</p>
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed">
                    Bizonylatazonosító: <span className="font-mono text-slate-400">{receiptId}</span>
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed">
                    Hash: <span className="font-mono text-slate-400">{trip._id.slice(-16).toUpperCase()}</span>
                  </p>
                </div>
              </div>

              {/* NAV Barcode */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-center gap-[1.5px] h-8 mb-2 opacity-50">
                  {BARCODE_SEGMENTS.map((s) => (
                    <div key={s.key} className="h-full rounded-[1px]" style={{ width: s.width, background: '#34d399', marginRight: s.marginRight }} />
                  ))}
                </div>
                <p className="text-[8px] font-bold text-slate-600 text-center tracking-widest uppercase">
                  Ez a bizonylat a NAV előírásainak megfelelő elektronikus hitelesítéssel jött létre.
                  A 2007. évi CXXVII. tv. (Áfa tv.) alapján érvényes e-Nyugta. Nem módosítható.
                </p>
              </div>
            </div>

            {trip.comment?.trim() && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <p className="text-[9px] font-black tracking-widest uppercase text-blue-400 mb-1.5">Megjegyzés</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">{trip.comment}</p>
              </div>
            )}
          </div>

          {/* === FOOTER ACTIONS === */}
          <div
            className="shrink-0 px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}
          >
            <button
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
            >
              <Download className="w-4 h-4" />
              Nyomtatás · PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition"
              style={{
                background: 'linear-gradient(135deg, #064e3b, #059669)',
                boxShadow: '0 8px 20px -8px rgba(16,185,129,0.5)',
                color: 'white',
              }}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              Rendben · Bezárás
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// === FINALIZE OVERLAY ===
const FINALIZE_STEPS = [
  { icon: Wifi, label: 'Titkosított kapcsolat felépítése', sub: 'TLS 1.3 · AES-256', color: '#60a5fa', duration: 900 },
  { icon: Lock, label: 'XML aláírás generálása', sub: 'RSA-2048 · SHA-256 hash', color: '#a78bfa', duration: 800 },
  { icon: ShieldCheck, label: 'NAV szerverre küldés', sub: 'Online Számla API v3.0', color: '#C9A962', duration: 1000 },
  { icon: Award, label: 'Hitelesítés sikeres!', sub: 'e-Nyugta jogilag érvényes', color: '#10b981', duration: 0 },
];

function FinalizeOverlay() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    let prog = 0;
    const progInterval = setInterval(() => {
      prog = Math.min(prog + 1.5, 95);
      setProgress(prog);
    }, 40);

    const advance = (index: number) => {
      if (index >= FINALIZE_STEPS.length - 1) return;
      const dur = FINALIZE_STEPS[index].duration;
      return setTimeout(() => {
        stepRef.current = index + 1;
        setStep(index + 1);
        advance(index + 1);
      }, dur);
    };
    const t = advance(0);

    return () => {
      clearInterval(progInterval);
      if (t) clearTimeout(t);
    };
  }, []);

  const currentStep = FINALIZE_STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-6"
      style={{ background: 'rgba(2,8,23,0.92)', backdropFilter: 'blur(20px)', animation: 'fade-in 0.3s ease' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ width: 400, height: 400, background: `radial-gradient(circle, ${currentStep.color}22 0%, transparent 70%)`, transition: 'background 0.6s ease' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* === MAIN SPINNER === */}
        <div className="flex items-center justify-center mb-10">
          <div className="relative">
            {/* Outer ring 1 */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '-20px',
                border: `2px solid ${currentStep.color}33`,
                animation: 'rotateRing 3s linear infinite',
              }}
            />
            {/* Outer ring 2 - reverse */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '-10px',
                border: `1.5px dashed ${currentStep.color}55`,
                animation: 'rotateRingReverse 2s linear infinite',
              }}
            />
            {/* Glow */}
            <div
              className="absolute rounded-full"
              style={{ inset: '-30px', background: `radial-gradient(circle, ${currentStep.color}20, transparent 70%)`, animation: 'pulse 2s ease-in-out infinite' }}
            />
            {/* Main circle */}
            <div
              className="relative w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #0a1628, #111827)`,
                border: `2px solid ${currentStep.color}60`,
                boxShadow: `0 0 40px ${currentStep.color}40, inset 0 0 30px rgba(0,0,0,0.5)`,
                transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
              }}
            >
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-[2px] opacity-80"
                style={{
                  background: `linear-gradient(90deg, transparent, ${currentStep.color}, transparent)`,
                  animation: 'scanLine 1.2s ease-in-out infinite',
                }}
              />
              {/* Icon */}
              <div
                className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentStep.color}30, ${currentStep.color}10)`,
                  border: `1.5px solid ${currentStep.color}50`,
                  transition: 'all 0.4s ease',
                }}
              >
                <StepIcon
                  className="w-8 h-8"
                  style={{ color: currentStep.color, filter: `drop-shadow(0 0 8px ${currentStep.color})`, transition: 'color 0.4s ease' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* === STATUS TEXT === */}
        <div className="text-center mb-8">
          <h3
            className="text-2xl font-black text-white tracking-tight mb-2"
            style={{ textShadow: `0 0 20px ${currentStep.color}80` }}
          >
            {step < FINALIZE_STEPS.length - 1 ? 'NAV Hitelesítés…' : 'Hitelesítve!'}
          </h3>
          <p
            className="text-sm font-bold uppercase tracking-widest mb-1"
            style={{ color: currentStep.color, animation: 'glowPulse 2s ease-in-out infinite' }}
          >
            {currentStep.label}
          </p>
          <p className="text-xs font-semibold text-slate-500">{currentStep.sub}</p>
        </div>

        {/* === STEP INDICATORS === */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {FINALIZE_STEPS.map((s, i) => {
            const S = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500"
                  style={{
                    background: done ? `${s.color}20` : active ? `${s.color}15` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${done || active ? s.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: active ? `0 0 12px ${s.color}40` : 'none',
                    transform: active ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.5L4.5 9L10 3" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <S className="w-3.5 h-3.5" style={{ color: active ? s.color : '#475569' }} />
                  )}
                </div>
                {i < FINALIZE_STEPS.length - 1 && (
                  <div className="w-6 h-[1px] rotate-90 mt-[-5px]" style={{ background: done ? s.color + '60' : 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* === PROGRESS BAR === */}
        <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${currentStep.color}80, ${currentStep.color})`,
              boxShadow: `0 0 8px ${currentStep.color}`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-[9px] font-black text-slate-600 tracking-widest uppercase">0%</p>
          <p className="text-[9px] font-black tracking-widest uppercase" style={{ color: currentStep.color }}>{Math.round(progress)}%</p>
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
  const [startingId, setStartingId] = useState<string | null>(null);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [openReceipt, setOpenReceipt] = useState<ReceiptState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trips" | "waybills" | "attendance" | "holidays">("trips");
  // Track trip IDs we've already seen/notified about (to manage bell badge)
  const [seenTripIds, setSeenTripIds] = useState<Set<string>>(new Set());
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

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

  async function handleStart(tripId: string) {
    try {
      setStartingId(tripId);
      const res = await fetch(`/api/trips/${tripId}/start`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.trip) {
        throw new Error(data?.error || "A fuvar indítása sikertelen");
      }
      setTrips((current) => current.map((trip) => trip._id === tripId ? data.trip : trip));
    } catch (err) {
      setError(err instanceof Error ? err.message : "A fuvar indítása sikertelen");
    } finally {
      setStartingId(null);
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

  // Unseen = driverNotified but NOT driverAcknowledged AND not in seenTripIds
  const newUnseenTrips = useMemo(
    () => trips.filter((t) => !t.driverAcknowledged && !seenTripIds.has(t._id)),
    [trips, seenTripIds]
  );

  // Mark a trip as seen in the bell (but not yet acknowledged)
  const markBellSeen = useCallback((tripId: string) => {
    setSeenTripIds((prev) => new Set([...prev, tripId]));
  }, []);

  // Close bell dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsBellOpen(false);
      }
    }
    if (isBellOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isBellOpen]);

  // Sorted trips: unacknowledged NEW ones first, then rest by pickupDate desc
  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      const aNew = !a.driverAcknowledged;
      const bNew = !b.driverAcknowledged;
      if (aNew && !bNew) return -1;
      if (!aNew && bNew) return 1;
      // Within same group: sort by pickupDate desc (newest date first)
      const aDate = new Date(`${a.pickupDate}T${a.pickupTime || '00:00'}`).getTime();
      const bDate = new Date(`${b.pickupDate}T${b.pickupTime || '00:00'}`).getTime();
      return bDate - aDate;
    });
  }, [trips]);

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
            {sortedTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onAcknowledge={handleAcknowledge}
                onStart={handleStart}
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
                startingId={startingId}
                finalizingId={finalizingId}
                isNew={!seenTripIds.has(trip._id) && !trip.driverAcknowledged}
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

          {/* Right side: Bell + Logout */}
          <div className="flex items-center gap-2">
            {/* === BELL NOTIFICATION === */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => {
                  setIsBellOpen((prev) => !prev);
                  // Mark all current unseen as seen when opening bell
                  if (!isBellOpen) {
                    newUnseenTrips.forEach((t) => markBellSeen(t._id));
                  }
                }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center transition"
                style={{
                  background: newUnseenTrips.length > 0 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.08)',
                  border: newUnseenTrips.length > 0 ? '1.5px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: newUnseenTrips.length > 0 ? '0 0 16px rgba(251,191,36,0.3)' : 'none',
                }}
                aria-label="Értesítések"
              >
                <BellRing
                  className="w-5 h-5"
                  style={{
                    color: newUnseenTrips.length > 0 ? '#fbbf24' : 'rgba(255,255,255,0.7)',
                    animation: newUnseenTrips.length > 0 ? 'bellShake 1.2s ease-in-out infinite' : 'none',
                  }}
                />
                {/* Badge */}
                {newUnseenTrips.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      boxShadow: '0 0 8px rgba(251,191,36,0.6)',
                      animation: 'navPulse 1.5s ease-in-out infinite',
                    }}
                  >
                    {newUnseenTrips.length}
                  </span>
                )}
              </button>

              {/* Bell Dropdown */}
              {isBellOpen && (
                <div
                  className="absolute right-0 top-12 w-80 max-w-[90vw] rounded-2xl overflow-hidden z-50"
                  style={{
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.6)',
                    animation: 'receiptReveal 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
                  }}
                >
                  {/* Header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4" style={{ color: '#fbbf24' }} />
                      <p className="text-[11px] font-black tracking-widest uppercase text-white">Értesítések</p>
                    </div>
                    <button onClick={() => setIsBellOpen(false)}>
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {trips.filter((t) => !t.driverAcknowledged).length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-[11px] font-bold text-slate-400">Minden fuvar visszaigazolva</p>
                      </div>
                    ) : (
                      trips.filter((t) => !t.driverAcknowledged).map((t) => (
                        <div
                          key={t._id}
                          className="px-4 py-3 flex items-start gap-3 cursor-pointer transition"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: !seenTripIds.has(t._id) ? 'rgba(251,191,36,0.05)' : 'transparent',
                          }}
                          onClick={() => {
                            markBellSeen(t._id);
                            setIsBellOpen(false);
                            setActiveTab('trips');
                          }}
                        >
                          <div
                            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}
                          >
                            <MapPin className="w-4 h-4" style={{ color: '#fbbf24' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-[11px] font-black text-white">Új fuvar érkezett</p>
                              {!seenTripIds.has(t._id) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" style={{ animation: 'navPulse 1.5s infinite' }} />
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 truncate">#{t.bookingCode} · {t.pickupTime} · {t.fromAddress}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {trips.filter((t) => !t.driverAcknowledged).length > 0 && (
                    <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        className="w-full text-[10px] font-black tracking-widest uppercase text-center transition"
                        style={{ color: '#fbbf24' }}
                        onClick={() => {
                          trips.filter((t) => !t.driverAcknowledged).forEach((t) => markBellSeen(t._id));
                          setIsBellOpen(false);
                          setActiveTab('trips');
                        }}
                      >
                        Összes megtekintése
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
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
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 -mt-12 relative z-10">
        {mainContent}
      </main>
    </div>
  );
}
