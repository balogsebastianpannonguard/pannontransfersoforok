import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { findStaffUserByDirectLoginToken } from "@/lib/staff-direct-login";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * Jelszó nélküli "egyedi belépés" sofőrök/adminok számára, akik egy személyes,
 * állandó hozzáférési linket kaptak. A normál e-mail+jelszavas bejelentkezést
 * egyáltalán nem érinti.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { token?: string };
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ success: false, message: "Hiányzó token." }, { status: 400 });
    }

    const staffUser = await findStaffUserByDirectLoginToken(token);
    if (!staffUser) {
      return NextResponse.json({ success: false, message: "Érvénytelen link." }, { status: 404 });
    }
    if (staffUser.role !== "driver" && staffUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Nincs jogosultság a Sofőr Modulhoz." },
        { status: 403 }
      );
    }

    const payload = {
      id: staffUser._id,
      email: staffUser.email,
      name: staffUser.name || staffUser.email.split("@")[0],
      role: staffUser.role,
    };

    const secret = new TextEncoder().encode(
      process.env.AUTH_COOKIE_VALUE || "default_driver_secret_key_2025"
    );
    // Az egyedi belépő linkkel létrehozott munkamenet nem jár le (a normál
    // e-mail+jelszavas bejelentkezés 30 napos lejárata ettől függetlenül megmarad).
    const sessionToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("100y")
      .sign(secret);

    const { db } = await connectToDatabase();
    await db
      .collection("staff_users")
      .updateOne({ _id: new ObjectId(staffUser._id) }, { $set: { lastLoginAt: new Date() } });

    const response = NextResponse.json({ success: true });
    response.cookies.set("driver_auth_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 100 * 365 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error("[Driver Direct Login Error]", err);
    return NextResponse.json(
      { success: false, message: "Váratlan hiba történt. Kérjük, próbálja újra." },
      { status: 500 }
    );
  }
}
