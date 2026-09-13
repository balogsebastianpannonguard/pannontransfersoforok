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

    if (!token) {
      return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, AUTH_SECRET);
    const driverId = typeof payload.id === "string" ? payload.id : "";
    const driverEmail = typeof payload.email === "string" ? payload.email : "driver";
    const driverName =
      typeof payload.name === "string" && payload.name.trim().length > 0
        ? payload.name
        : driverEmail;
    const role = typeof payload.role === "string" ? payload.role : "";

    if (!driverId || (role !== "driver" && role !== "admin")) {
      return NextResponse.json({ error: "Nincs jogosultságod" }, { status: 403 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();
    const now = Date.now();

    const updatedTrip = await db.collection("bookings").findOneAndUpdate(
      {
        _id: new ObjectId(id),
        assignedDriverId: driverId,
        driverNotified: true,
      },
      {
        $set: {
          driverAcknowledged: true,
          updatedAt: now,
        },
        $push: {
          auditTrail: {
            timestamp: now,
            action: "driver_acknowledged",
            actor: driverEmail,
            details: `${driverName} visszaigazolta, hogy latta a fuvart.`,
          },
        },
      } as any,
      { returnDocument: "after" }
    );

    if (!updatedTrip) {
      return NextResponse.json({ error: "A fuvar nem talalhato" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      trip: {
        ...updatedTrip,
        _id: updatedTrip._id.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "A visszaigazolas sikertelen" }, { status: 500 });
  }
}
