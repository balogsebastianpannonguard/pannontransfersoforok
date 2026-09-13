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
    const receiptId = `R-${now.toString(36).toUpperCase()}-${new ObjectId().toString().slice(-6).toUpperCase()}`;

      await new Promise(resolve => setTimeout(resolve, 3000));

      const updatedTrip = await db.collection("bookings").findOneAndUpdate(
      {
        _id: new ObjectId(id),
        assignedDriverId: driverId,
        driverAcknowledged: true,
        status: { $in: ["confirmed", "in-progress"] },
      },
      {
        $set: {
          status: "completed",
          completedAt: now,
          completedBy: driverId,
          receipt: {
            id: receiptId,
            issuedAt: now,
            issuedBy: driverName,
            driverEmail: driverEmail,
            status: "issued",
          },
          updatedAt: now,
        },
        $push: {
          auditTrail: {
            timestamp: now,
            action: "trip_completed",
            actor: driverEmail,
            details: `${driverName} lezarta a fuvar es e-nyugtat kiallitotta. Nyugta azonosito: ${receiptId}`,
          },
        },
      } as any,
      { returnDocument: "after" }
    );

    if (!updatedTrip) {
      return NextResponse.json(
        { error: "A fuvar nem talalhato, vagy nem allapota nem modosithato." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: receiptId,
        issuedAt: now,
        issuedBy: driverName,
      },
      trip: {
        ...updatedTrip,
        _id: updatedTrip._id.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "A nyugta kiallitasa sikertelen" },
      { status: 500 }
    );
  }
}
