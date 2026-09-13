import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_COOKIE_VALUE || "default_driver_secret_key_2025"
);

const WAYBILL_COLLECTION = "driver_waybills";

interface DriverSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

async function getDriverSession(): Promise<DriverSession | null> {
  const token = (await cookies()).get("driver_auth_token")?.value;

  if (!token) {
    return null;
  }

  const { payload } = await jwtVerify(token, AUTH_SECRET);
  const id = typeof payload.id === "string" ? payload.id : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const name = typeof payload.name === "string" ? payload.name : email;
  const role = typeof payload.role === "string" ? payload.role : "";

  if (!id || (role !== "driver" && role !== "admin")) {
    return null;
  }

  return { id, email, name, role };
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseStops(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      address: typeof item.address === "string" ? item.address.trim() : "",
      time: typeof item.time === "string" ? item.time.trim() : "",
      km: typeof item.km === "string" || typeof item.km === "number" ? parseNumber(item.km) : undefined,
    }))
    .filter((item) => item.address.length > 0);
}

function normalizeWaybill(
  body: Record<string, unknown>,
  session: DriverSession,
  createdAt: number
) {
  const startDate =
    typeof body?.startDate === "string" && body.startDate.trim().length > 0
      ? body.startDate.trim()
      : "";
  const startTime = typeof body?.startTime === "string" ? body.startTime.trim() : "";
  const startLocation =
    typeof body?.startLocation === "string" ? body.startLocation.trim() : "";
  const pickupStops = parseStops(body?.pickupStops);
  const destinationStops = parseStops(body?.destinationStops);
  const entryDateTime =
    startDate && startTime
      ? `${startDate}T${startTime}`
      : startDate
        ? `${startDate}T00:00`
        : typeof body?.entryDateTime === "string" && body.entryDateTime.trim().length > 0
          ? body.entryDateTime
          : "";

  return {
    driverId: session.id,
    driverName: session.name,
    driverEmail: session.email,
    entryDateTime,
    startDate,
    deviationStatus: body?.deviationStatus === "deviation" ? "deviation" : "ok",
    licensePlate:
      typeof body?.licensePlate === "string" ? body.licensePlate.trim().toUpperCase() : "",
    startLocation,
    startBaseLocation: startLocation,
    startTime,
    startKm: parseNumber(body?.startKm),
    pickupStops,
    destinationStops,
    pickupAddresses: pickupStops.map((item) => item.address),
    destinationAddresses: destinationStops.map((item) => item.address),
    endBaseLocation: destinationStops.at(-1)?.address || "",
    endTime: typeof body?.endTime === "string" ? body.endTime.trim() : "",
    endKm: parseNumber(body?.endKm),
    transportedPassengers: parseNumber(body?.transportedPassengers),
    transportedPackages: parseNumber(body?.transportedPackages),
    fareAmount: parseNumber(body?.fareAmount),
    farePaymentMethod:
      typeof body?.farePaymentMethod === "string" ? body.farePaymentMethod.trim() : "",
    electronicInvoice: body?.electronicInvoice === "no" ? "no" : "yes",
    fuelLiters: parseNumber(body?.fuelLiters),
    parkingCardBalance: parseNumber(body?.parkingCardBalance),
    washCardBalance: parseNumber(body?.washCardBalance),
    adBlue: typeof body?.adBlue === "string" ? body.adBlue.trim() : "",
    notes: typeof body?.notes === "string" ? body.notes.trim() : "",
    createdAt,
    updatedAt: Date.now(),
  };
}

function validateWaybill(waybill: ReturnType<typeof normalizeWaybill>) {
  if (!waybill.startDate) return "Az indulás dátuma kötelező.";
  if (!waybill.licensePlate) return "A rendszám megadása kötelező.";
  if (!waybill.startBaseLocation) return "Az indulás helye kötelező.";
  if (!waybill.startTime) return "Az indulás időpontja kötelező.";
  if (waybill.pickupStops.length === 0) return "Legalább egy felvételi cím szükséges.";
  if (waybill.destinationStops.length === 0) return "Legalább egy célállomás szükséges.";
  if (!waybill.farePaymentMethod) return "A viteldíj fizetési módja kötelező.";
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getDriverSession();

    if (!session) {
      return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Érvénytelen menetlevél azonosító" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const existingWaybill = await db.collection(WAYBILL_COLLECTION).findOne({
      _id: new ObjectId(id),
      driverId: session.id,
    });

    if (!existingWaybill) {
      return NextResponse.json({ error: "A menetlevél nem található" }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const waybill = normalizeWaybill(body, session, existingWaybill.createdAt || Date.now());
    const validationError = validateWaybill(waybill);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updatedWaybill = await db.collection(WAYBILL_COLLECTION).findOneAndUpdate(
      {
        _id: new ObjectId(id),
        driverId: session.id,
      },
      {
        $set: waybill,
      },
      { returnDocument: "after" }
    );

    if (!updatedWaybill) {
      return NextResponse.json({ error: "A menetlevél nem található" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      waybill: {
        ...updatedWaybill,
        _id: updatedWaybill._id.toString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "A menetlevél módosítása nem sikerült" },
      { status: 500 }
    );
  }
}
