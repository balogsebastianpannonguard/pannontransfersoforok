import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: "Minden mező kitöltése kötelező!" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "A két jelszó nem egyezik meg!" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "A jelszónak legalább 8 karakter hosszúnak kell lennie!" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Hash the token since it's stored as hash in staff_users
    const inviteTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await db.collection("staff_users").findOne({
      inviteTokenHash,
      inviteExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: "Érvénytelen vagy lejárt meghívó link!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.collection("staff_users").updateOne(
      { _id: user._id },
      {
        $set: {
          hashedPassword,
          passwordHash: hashedPassword, // setting both to be safe
          isActivated: true,
          status: "active",
          activatedAt: Date.now(),
          updatedAt: Date.now(),
        },
        $unset: {
          inviteTokenHash: "",
          inviteRawToken: "",
          inviteExpiresAt: "",
          inviteIssuedAt: "",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Jelszó sikeresen beállítva. Kérjük, jelentkezz be.",
    });
  } catch (error: any) {
    console.error("Setup password error:", error);
    return NextResponse.json({ error: "Belső szerverhiba történt." }, { status: 500 });
  }
}
