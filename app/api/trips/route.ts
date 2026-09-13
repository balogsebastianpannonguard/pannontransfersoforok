import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_COOKIE_VALUE || "default_driver_secret_key_2025"
);

export async function GET() {
  try {
    const token = (await cookies()).get("driver_auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, AUTH_SECRET);
    const driverId = typeof payload.id === "string" ? payload.id : "";
    const role = typeof payload.role === "string" ? payload.role : "";

    if (!driverId || (role !== "driver" && role !== "admin")) {
      return NextResponse.json({ error: "Nincs jogosultságod" }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const trips = await db
      .collection("bookings")
      .find({
        assignedDriverId: driverId,
        driverNotified: true,
        status: { $in: ["confirmed", "in-progress", "completed"] },
      })
      .sort({ pickupDate: 1, pickupTime: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      trips: trips.map((trip: any) => ({
        ...trip,
        _id: trip._id.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Nem sikerult betolteni a fuvarokat" }, { status: 500 });
  }
}
