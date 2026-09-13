"use client";

import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileCheck2,
  FolderOpen,
  MapPinned,
  Pencil,
  Plus,
  RefreshCw,
  Route,
  Save,
  Trash2,
  User2,
} from "lucide-react";

interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

type DeviationStatus = "ok" | "deviation";
type ElectronicInvoiceValue = "yes" | "no";

interface RouteStop {
  address: string;
  time: string;
  km: string;
}

interface SavedRouteStop {
  address: string;
  time?: string;
  km?: number;
}

interface WaybillRecord {
  _id: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  entryDateTime: string;
  startDate?: string;
  deviationStatus: DeviationStatus;
  licensePlate: string;
  startLocation?: string;
  startBaseLocation: string;
  startTime: string;
  startKm: number;
  pickupStops?: SavedRouteStop[];
  destinationStops?: SavedRouteStop[];
  pickupAddresses?: string[];
  destinationAddresses?: string[];
  endBaseLocation: string;
  endTime: string;
  endKm: number;
  transportedPassengers: number;
  transportedPackages: number;
  fareAmount: number;
  farePaymentMethod: string;
  electronicInvoice: ElectronicInvoiceValue;
  fuelLiters: number;
  parkingCardBalance: number;
  washCardBalance: number;
  adBlue: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

interface WaybillFormState {
  startDate: string;
  deviationStatus: DeviationStatus;
  licensePlate: string;
  startLocation: string;
  startTime: string;
  startKm: string;
  pickupStops: RouteStop[];
  destinationStops: RouteStop[];
  endTime: string;
  endKm: string;
  transportedPassengers: string;
  transportedPackages: string;
  fareAmount: string;
  farePaymentMethod: string;
  electronicInvoice: ElectronicInvoiceValue;
  fuelLiters: string;
  parkingCardBalance: string;
  washCardBalance: string;
  adBlue: string;
  notes: string;
  driverName: string;
  driverEmail: string;
}

const PAYMENT_OPTIONS = [
  "Készpénz - HUF",
  "Készpénz - EUR",
  "Készpénz - RON",
  "Bankkártya",
  "Utalás - HUF",
  "Utalás - EUR",
  "Utalás - RON",
] as const;

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

function toLocalDateValue(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function createEmptyStop(): RouteStop {
  return {
    address: "",
    time: "",
    km: "",
  };
}

function createEmptyForm(user: DriverUser | null): WaybillFormState {
  return {
    startDate: toLocalDateValue(),
    deviationStatus: "ok",
    licensePlate: "",
    startLocation: "",
    startTime: "",
    startKm: "",
    pickupStops: [createEmptyStop()],
    destinationStops: [createEmptyStop()],
    endTime: "",
    endKm: "",
    transportedPassengers: "0",
    transportedPackages: "0",
    fareAmount: "0",
    farePaymentMethod: PAYMENT_OPTIONS[0],
    electronicInvoice: "yes",
    fuelLiters: "0",
    parkingCardBalance: "0",
    washCardBalance: "0",
    adBlue: "",
    notes: "",
    driverName: user?.name || "",
    driverEmail: user?.email || "",
  };
}

function formatWaybillDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatUpdatedAt(value: number) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function stopPreview(stop: SavedRouteStop) {
  const parts = [stop.address];
  if (stop.time) parts.push(stop.time);
  if (typeof stop.km === "number" && Number.isFinite(stop.km)) parts.push(`${stop.km} km`);
  return parts.filter(Boolean).join(" • ");
}

function normalizeStopsFromRecord(
  stops?: SavedRouteStop[],
  fallbackAddresses?: string[]
): RouteStop[] {
  if (Array.isArray(stops) && stops.length > 0) {
    return stops.map((stop) => ({
      address: stop.address || "",
      time: stop.time || "",
      km:
        typeof stop.km === "number" && Number.isFinite(stop.km)
          ? String(stop.km)
          : "",
    }));
  }

  if (Array.isArray(fallbackAddresses) && fallbackAddresses.length > 0) {
    return fallbackAddresses.map((address) => ({
      address,
      time: "",
      km: "",
    }));
  }

  return [createEmptyStop()];
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  list,
  className,
  uppercase,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  list?: string;
  className?: string;
  uppercase?: boolean;
  type?: ComponentProps<"input">["type"];
  inputMode?: ComponentProps<"input">["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        list={list}
        required={required}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#C9A962] focus:ring-4 focus:ring-[#C9A962]/15 ${uppercase ? "uppercase" : ""} ${className || ""}`}
      />
    </label>
  );
}

function NumericField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value.replace(",", "."))}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#C9A962] focus:ring-4 focus:ring-[#C9A962]/15"
      />
    </label>
  );
}

function SelectionGrid({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (option: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-slate-700">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isActive = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                isActive
                  ? "border-[#C9A962] bg-[#0B1A2A] text-[#F7F5F1] shadow-lg shadow-[#0B1A2A]/15"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StopListField({
  title,
  icon,
  values,
  placeholder,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  icon: ReactNode;
  values: RouteStop[];
  placeholder: string;
  onChange: (index: number, key: keyof RouteStop, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0B1A2A] shadow-sm">
            {icon}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{title}</p>
            <p className="text-xs font-semibold text-slate-500">
              Cím, idő és km is megadható minden megállóhoz.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0B1A2A] px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#10263F]"
        >
          <Plus className="h-4 w-4 text-[#C9A962]" />
          Új pont
        </button>
      </div>

      <div className="space-y-4">
        {values.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600">
                  {index + 1}
                </div>
                <p className="text-sm font-black text-slate-900">{title.slice(0, -1)} #{index + 1}</p>
              </div>
              {values.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.6fr)_140px_140px]">
              <input
                type="text"
                value={item.address}
                placeholder={placeholder}
                onChange={(event) => onChange(index, "address", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C9A962] focus:ring-4 focus:ring-[#C9A962]/15"
              />
              <input
                type="time"
                value={item.time}
                onChange={(event) => onChange(index, "time", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none transition focus:border-[#C9A962] focus:ring-4 focus:ring-[#C9A962]/15"
              />
              <input
                type="text"
                inputMode="decimal"
                value={item.km}
                placeholder="Km"
                onChange={(event) => onChange(index, "km", event.target.value.replace(",", "."))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C9A962] focus:ring-4 focus:ring-[#C9A962]/15"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WaybillsPanel({ user }: { user: DriverUser | null }) {
  const [waybills, setWaybills] = useState<WaybillRecord[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);
  const [form, setForm] = useState<WaybillFormState>(() => createEmptyForm(user));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadWaybills = useCallback(
    async (refresh = false) => {
      if (!user?.id) return;

      try {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        setError(null);

        const response = await fetch("/api/waybills", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Nem sikerült betölteni a menetleveleket");
        }

        setWaybills(Array.isArray(data?.waybills) ? data.waybills : []);
        setVehicleOptions(Array.isArray(data?.vehicleOptions) ? data.vehicleOptions : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nem sikerült betölteni a menetleveleket");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWaybills();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWaybills]);

  const savedCountLabel = useMemo(() => `${waybills.length} db`, [waybills.length]);

  const resetForm = useCallback(
    (keepSuccess = false) => {
      setEditingId(null);
      if (!keepSuccess) {
        setSuccess(null);
      }
      setForm(createEmptyForm(user));
    },
    [user]
  );

  const applyWaybillToForm = useCallback((waybill: WaybillRecord) => {
    setEditingId(waybill._id);
    setForm({
      startDate: waybill.startDate || waybill.entryDateTime.slice(0, 10),
      deviationStatus: waybill.deviationStatus,
      licensePlate: waybill.licensePlate,
      startLocation: waybill.startLocation || waybill.startBaseLocation || "",
      startTime: waybill.startTime || "",
      startKm: waybill.startKm ? String(waybill.startKm) : "",
      pickupStops: normalizeStopsFromRecord(waybill.pickupStops, waybill.pickupAddresses),
      destinationStops: normalizeStopsFromRecord(
        waybill.destinationStops,
        waybill.destinationAddresses || (waybill.endBaseLocation ? [waybill.endBaseLocation] : [])
      ),
      endTime: waybill.endTime || "",
      endKm: waybill.endKm ? String(waybill.endKm) : "",
      transportedPassengers: String(waybill.transportedPassengers ?? 0),
      transportedPackages: String(waybill.transportedPackages ?? 0),
      fareAmount: String(waybill.fareAmount ?? 0),
      farePaymentMethod: waybill.farePaymentMethod,
      electronicInvoice: waybill.electronicInvoice,
      fuelLiters: String(waybill.fuelLiters ?? 0),
      parkingCardBalance: String(waybill.parkingCardBalance ?? 0),
      washCardBalance: String(waybill.washCardBalance ?? 0),
      adBlue: waybill.adBlue,
      notes: waybill.notes,
      driverName: waybill.driverName,
      driverEmail: waybill.driverEmail,
    });
  }, []);

  const handleEdit = (waybill: WaybillRecord) => {
    setSuccess(null);
    setError(null);
    applyWaybillToForm(waybill);

    document.getElementById("waybill-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const updateFormValue = (key: keyof WaybillFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateStopValue = (
    key: "pickupStops" | "destinationStops",
    index: number,
    field: keyof RouteStop,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addStop = (key: "pickupStops" | "destinationStops") => {
    setForm((current) => ({
      ...current,
      [key]: [...current[key], createEmptyStop()],
    }));
  };

  const removeStop = (key: "pickupStops" | "destinationStops", index: number) => {
    setForm((current) => {
      const nextItems = current[key].filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        [key]: nextItems.length > 0 ? nextItems : [createEmptyStop()],
      };
    });
  };

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        ...form,
        startLocation: form.startLocation.trim(),
        pickupStops: form.pickupStops.map((item) => ({
          address: item.address.trim(),
          time: item.time.trim(),
          km: item.km.trim(),
        })),
        destinationStops: form.destinationStops.map((item) => ({
          address: item.address.trim(),
          time: item.time.trim(),
          km: item.km.trim(),
        })),
        driverName: user?.name || form.driverName,
        driverEmail: user?.email || form.driverEmail,
      };

      const response = await fetch(editingId ? `/api/waybills/${editingId}` : "/api/waybills", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.waybill) {
        throw new Error(data?.error || "A menetlevél mentése nem sikerült");
      }

      const savedWaybill: WaybillRecord = data.waybill;
      setWaybills((current) => [
        savedWaybill,
        ...current.filter((item) => item._id !== savedWaybill._id),
      ]);
      setSuccess("A menetlevél mentve lett, az űrlap új alaphelyzetre állt.");
      resetForm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A menetlevél mentése nem sikerült");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <RefreshCw className="mx-auto mb-4 h-7 w-7 animate-spin text-slate-400" />
        <p className="text-sm font-bold text-slate-500">Menetlevelek betöltése…</p>
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Saját mappa
          </p>
          <p className="text-2xl font-black text-slate-900">{savedCountLabel}</p>
        </div>
        <div className="rounded-2xl border border-[#E7D9B1] bg-gradient-to-br from-[#FFF9EC] to-white p-4 shadow-sm">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#9E7D32]">
            Működés
          </p>
          <p className="text-lg font-black text-[#0B1A2A]">
            {editingId ? "Szerkesztés alatt" : "Alaphelyzetben"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Sofőr
          </p>
          <p className="text-sm font-black text-slate-900">{user?.name || "-"}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <section
          id="waybill-form"
          className="overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-sm"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0B1A2A] via-[#10263F] to-[#0F1D31] px-5 py-6 text-white sm:px-6">
            <div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#C9A962]/20 blur-3xl" />
            <div className="absolute bottom-[-72px] left-[-32px] h-36 w-36 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C9A962]">
                  Pannon Transfer
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Menetlevél</h2>
                <p className="mt-1 text-sm font-medium text-slate-300">
                  Mentés után automatikusan új üres lapra vált.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => loadWaybills(true)}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/15"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Frissítés
                </button>
                <button
                  type="button"
                  onClick={() => resetForm()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#C9A962]/40 bg-[#C9A962] px-4 py-3 text-xs font-black uppercase tracking-widest text-[#0B1A2A] transition hover:brightness-105"
                >
                  <Plus className="h-4 w-4" />
                  Új lap
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5 lg:col-span-2">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0B1A2A] shadow-sm">
                    <MapPinned className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">Indulási adatok</p>
                    <p className="text-xs font-semibold text-slate-500">
                      Itt add meg a kiinduló helyet, a dátumot és a km állást.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField
                    label="Indulás helye"
                    value={form.startLocation}
                    onChange={(value) => updateFormValue("startLocation", value)}
                    placeholder="Pl.: Debrecen telephely"
                    required
                  />
                  <TextField
                    label="Rendszám"
                    value={form.licensePlate}
                    onChange={(value) => updateFormValue("licensePlate", value.toUpperCase())}
                    placeholder="Pl.: REX-072"
                    required
                    list="waybill-vehicle-options"
                    uppercase
                  />
                  <TextField
                    label="Indulás dátuma"
                    type="date"
                    value={form.startDate}
                    onChange={(value) => updateFormValue("startDate", value)}
                    required
                  />
                  <TextField
                    label="Indulás időpontja"
                    type="time"
                    value={form.startTime}
                    onChange={(value) => updateFormValue("startTime", value)}
                    required
                  />
                  <NumericField
                    label="Indulási km óra állás"
                    value={form.startKm}
                    onChange={(value) => updateFormValue("startKm", value)}
                    placeholder="Pl.: 182450"
                  />
                  <div>
                    <p className="mb-2 block text-sm font-bold text-slate-700">Eltérés</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Ok", value: "ok" },
                        { label: "Eltérés", value: "deviation" },
                      ].map((item) => {
                        const isActive = form.deviationStatus === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() =>
                              updateFormValue("deviationStatus", item.value as DeviationStatus)
                            }
                            className={`rounded-2xl border px-4 py-4 text-base font-bold transition ${
                              isActive
                                ? "border-[#C9A962] bg-[#0B1A2A] text-[#F7F5F1]"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <datalist id="waybill-vehicle-options">
                  {vehicleOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>

              <div className="rounded-[26px] border border-[#E7D9B1] bg-[#FFF9EC] p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#9E7D32] shadow-sm">
                    <User2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">Sofőr adatok</p>
                    <p className="text-xs font-semibold text-slate-500">
                      Automatikusan a belépett sofőrhöz kötve.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-[#E7D9B1] bg-white px-4 py-3">
                    <p className="text-xs font-bold text-slate-500">Sofőr neve</p>
                    <p className="text-sm font-black text-slate-900">{user?.name || "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-[#E7D9B1] bg-white px-4 py-3">
                    <p className="text-xs font-bold text-slate-500">Sofőr email</p>
                    <p className="break-all text-sm font-black text-slate-900">
                      {user?.email || "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E7D9B1] bg-white px-4 py-3">
                    <p className="text-xs font-bold text-slate-500">Lap állapota</p>
                    <p className="text-sm font-black text-[#0B1A2A]">
                      {editingId ? "Mentett lap szerkesztése" : "Új menetlevél"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <StopListField
                title="Felvételi címek"
                icon={<Route className="h-5 w-5" />}
                values={form.pickupStops}
                placeholder="Felvételi cím"
                onChange={(index, key, value) => updateStopValue("pickupStops", index, key, value)}
                onAdd={() => addStop("pickupStops")}
                onRemove={(index) => removeStop("pickupStops", index)}
              />

              <StopListField
                title="Célállomások"
                icon={<MapPinned className="h-5 w-5" />}
                values={form.destinationStops}
                placeholder="Célállomás"
                onChange={(index, key, value) =>
                  updateStopValue("destinationStops", index, key, value)
                }
                onAdd={() => addStop("destinationStops")}
                onRemove={(index) => removeStop("destinationStops", index)}
              />
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0B1A2A] shadow-sm">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">Fuvar lezárás és pénzügy</p>
                  <p className="text-xs font-semibold text-slate-500">
                    Ide kerül minden záró adat, hogy működésben is kényelmes legyen.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TextField
                  label="Érkezés időpontja"
                  type="time"
                  value={form.endTime}
                  onChange={(value) => updateFormValue("endTime", value)}
                />
                <NumericField
                  label="Érkezési km óra állás"
                  value={form.endKm}
                  onChange={(value) => updateFormValue("endKm", value)}
                  placeholder="Pl.: 182670"
                />
                <NumericField
                  label="Szállított létszám"
                  value={form.transportedPassengers}
                  onChange={(value) => updateFormValue("transportedPassengers", value)}
                />
                <NumericField
                  label="Szállított csomag (db)"
                  value={form.transportedPackages}
                  onChange={(value) => updateFormValue("transportedPackages", value)}
                />
                <NumericField
                  label="Viteldíj"
                  value={form.fareAmount}
                  onChange={(value) => updateFormValue("fareAmount", value)}
                />
                <NumericField
                  label="Tankolt liter"
                  value={form.fuelLiters}
                  onChange={(value) => updateFormValue("fuelLiters", value)}
                />
                <NumericField
                  label="Parkolókártya egyenleg"
                  value={form.parkingCardBalance}
                  onChange={(value) => updateFormValue("parkingCardBalance", value)}
                />
                <NumericField
                  label="Mosókártya egyenleg"
                  value={form.washCardBalance}
                  onChange={(value) => updateFormValue("washCardBalance", value)}
                />
              </div>
            </div>

            <SelectionGrid
              label="Viteldíj fizetés módja"
              value={form.farePaymentMethod}
              options={[...PAYMENT_OPTIONS]}
              onChange={(option) => updateFormValue("farePaymentMethod", option)}
            />

            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Elektronikus számla</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Igen", value: "yes" },
                  { label: "Nem", value: "no" },
                ].map((item) => {
                  const isActive = form.electronicInvoice === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        updateFormValue("electronicInvoice", item.value as ElectronicInvoiceValue)
                      }
                      className={`rounded-2xl border px-4 py-4 text-base font-bold transition ${
                        isActive
                          ? "border-[#C9A962] bg-[#0B1A2A] text-[#F7F5F1]"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TextField
                label="adBlue"
                value={form.adBlue}
                onChange={(value) => updateFormValue("adBlue", value)}
                placeholder="Pl.: 10 liter"
              />
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Megjegyzés</span>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => updateFormValue("notes", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#C9A962] focus:ring-4 focus:ring-[#C9A962]/15"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0B1A2A] px-5 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#0B1A2A]/10 transition hover:bg-[#10263F] disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Mentés folyamatban...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-[#C9A962]" />
                    Menetlevél mentése és lezárása
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Új üres lap
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF9EC] text-[#9E7D32]">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9E7D32]">
                    Mentett menetlevelek
                  </p>
                  <h3 className="text-lg font-black text-slate-900">Saját mappa</h3>
                </div>
              </div>
            </div>

            <div className="max-h-[920px] space-y-3 overflow-y-auto p-4">
              {waybills.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <FileCheck2 className="mx-auto mb-3 h-7 w-7 text-slate-400" />
                  <p className="text-sm font-black text-slate-700">Még nincs mentett menetlevél</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Az első mentés után itt jelennek meg a saját lapjaid.
                  </p>
                </div>
              ) : (
                waybills.map((waybill) => {
                  const pickupSummary =
                    waybill.pickupStops?.map(stopPreview).join(" • ") ||
                    waybill.pickupAddresses?.filter(Boolean).join(" • ") ||
                    "Nincs felvételi cím";
                  const destinationSummary =
                    waybill.destinationStops?.map(stopPreview).join(" • ") ||
                    waybill.destinationAddresses?.filter(Boolean).join(" • ") ||
                    waybill.endBaseLocation ||
                    "Nincs célállomás";

                  return (
                    <button
                      key={waybill._id}
                      type="button"
                      onClick={() => handleEdit(waybill)}
                      className={`block w-full rounded-[24px] border p-4 text-left transition ${
                        editingId === waybill._id
                          ? "border-[#C9A962] bg-[#FFF9EC] shadow-md shadow-[#C9A962]/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {formatWaybillDate(waybill.entryDateTime)}
                          </p>
                          <h4 className="mt-1 text-lg font-black text-slate-900">
                            {waybill.licensePlate || "Rendszám nélkül"}
                          </h4>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                            waybill.deviationStatus === "deviation"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {waybill.deviationStatus === "deviation" ? "Eltérés" : "Ok"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Indulás
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {waybill.startLocation || waybill.startBaseLocation || "Nincs megadva"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Felvétel
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">{pickupSummary}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Célállomás
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">{destinationSummary}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-bold text-slate-500">
                        <span>Frissítve: {formatUpdatedAt(waybill.updatedAt)}</span>
                        <span className="inline-flex items-center gap-1 text-[#0B1A2A]">
                          <Pencil className="h-3.5 w-3.5" />
                          Szerkesztés
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Élő előnézet
            </p>
            <div className="mt-4 rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                  <User2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Aktuális sofőr</p>
                  <p className="text-sm font-black text-slate-900">{user?.name || "-"}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Indulás</p>
                  <p className="text-base font-black text-slate-900">
                    {form.startLocation || "Még nincs megadva"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Felvételi pontok</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {form.pickupStops
                      .filter((item) => item.address.trim())
                      .map((item) => [item.address, item.time, item.km ? `${item.km} km` : ""].filter(Boolean).join(" • "))
                      .join(" | ") || "Még nincs megadva"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Célállomások</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {form.destinationStops
                      .filter((item) => item.address.trim())
                      .map((item) => [item.address, item.time, item.km ? `${item.km} km` : ""].filter(Boolean).join(" • "))
                      .join(" | ") || "Még nincs megadva"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
