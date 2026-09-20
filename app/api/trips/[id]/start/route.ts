import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_COOKIE_VALUE || "default_driver_secret_key_2025"
);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get("driver_auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });

    const { payload } = await jwtVerify(token, AUTH_SECRET);
    const driverId = typeof payload.id === "string" ? payload.id : "";
    const driverEmail = typeof payload.email === "string" ? payload.email : "driver";
    const driverName = typeof payload.name === "string" && payload.name.trim() ? payload.name : driverEmail;
    const role = typeof payload.role === "string" ? payload.role : "";
    if (!driverId || (role !== "driver" && role !== "admin")) {
      return NextResponse.json({ error: "Nincs jogosultságod" }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(driverId)) {
      return NextResponse.json({ error: "Érvénytelen fuvarazonosító" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = Date.now();
    const bookingId = new ObjectId(id);

    const activeTrip = await db.collection("bookings").findOne({
      assignedDriverId: driverId,
      status: "in-progress",
      _id: { $ne: bookingId },
    });
    if (activeTrip) {
      return NextResponse.json({ error: "Már van folyamatban lévő fuvarod." }, { status: 409 });
    }

    const booking = await db.collection("bookings").findOne({
      _id: bookingId,
      assignedDriverId: driverId,
      driverAcknowledged: true,
      status: "confirmed",
    });
    if (!booking) {
      return NextResponse.json({ error: "A fuvar nem indítható el ebben az állapotban." }, { status: 409 });
    }

    const updatedTrip = await db.collection("bookings").findOneAndUpdate(
      { _id: bookingId, assignedDriverId: driverId, status: "confirmed" },
      {
        $set: {
          status: "in-progress",
          startedAt: now,
          startedBy: driverId,
          updatedAt: now,
        },
        $push: {
          auditTrail: {
            timestamp: now,
            action: "trip_started",
            actor: driverEmail,
            details: `${driverName} elkezdte a fuvart.`,
          },
        },
      } as any,
      { returnDocument: "after" }
    );
    if (!updatedTrip) return NextResponse.json({ error: "A fuvar indítása sikertelen." }, { status: 409 });

    await db.collection("staff_users").updateOne(
      { _id: new ObjectId(driverId), role: "driver" },
      { $set: { driverStatus: "on_route", updatedAt: now }, $unset: { driverAvailableAt: "" } }
    );
    if (booking.assignedVehicleId && ObjectId.isValid(String(booking.assignedVehicleId))) {
      await db.collection("vehicles").updateOne(
        { _id: new ObjectId(String(booking.assignedVehicleId)) },
        { $set: { status: "on_route", updatedAt: now } }
      );
    }

    return NextResponse.json({
      success: true,
      trip: { ...updatedTrip, _id: updatedTrip._id.toString() },
    });
  } catch (error) {
    console.error("[driver trip start error]", error);
    return NextResponse.json({ error: "A fuvar indítása sikertelen." }, { status: 500 });
  }
}
