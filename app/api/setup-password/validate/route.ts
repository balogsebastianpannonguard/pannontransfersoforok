import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, message: "Hiányzó token." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const inviteTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await db.collection("staff_users").findOne({
      inviteTokenHash,
      inviteExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ valid: false, message: "Érvénytelen vagy lejárt token." }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error: any) {
    console.error("Token validation error:", error);
    return NextResponse.json({ valid: false, message: "Szerverhiba." }, { status: 500 });
  }
}
