import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail és jelszó kötelező!" }, { status: 400 });
    }

    // 0. Hardcoded fallback for testing (admin@admin.com / admin)
    if (email === "admin@admin.com" && password === "admin") {
      return await createSession({
        id: "test-admin",
        email: "admin@admin.com",
        name: "Teszt Admin",
        role: "admin",
      });
    }

    // 1. Check for global superadmin (from env)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return await createSession({
        id: "superadmin",
        email: process.env.ADMIN_EMAIL || "admin",
        name: "Pannon Transfer Vezérigazgató",
        role: "admin",
      });
    }

    // 2. Check for general dispatcher override (from env)
    if (email === process.env.DISPATCHER_EMAIL && password === process.env.DISPATCHER_PASSWORD) {
      return await createSession({
        id: "env-dispatcher",
        email: process.env.DISPATCHER_EMAIL || "dispatcher",
        name: process.env.DISPATCHER_NAME || "Diszpécser",
        role: "dispatcher",
      });
    }

    // 3. Check MongoDB `staff_users` collection for drivers
    const { db } = await connectToDatabase();
    const user = await db.collection("staff_users").findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "Helytelen e-mail cím vagy jelszó!" }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "A fiók nem aktív vagy felfüggesztett!" }, { status: 403 });
    }

    // Sofőr appba csak sofőr és admin tudjon belépni (opcionális, de jó)
    if (user.role !== "driver" && user.role !== "admin") {
      return NextResponse.json({ error: "Nincs jogosultsága a Sofőr Modulhoz!" }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Helytelen e-mail cím vagy jelszó!" }, { status: 401 });
    }

    // Update last login
    await db.collection("staff_users").updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    return await createSession({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error: any) {
    console.error("Login hiba:", error);
    return NextResponse.json({ error: "Belső szerverhiba történt." }, { status: 500 });
  }
}

async function createSession(payload: { id: string; email: string; name: string; role: string }) {
  const secret = new TextEncoder().encode(process.env.AUTH_COOKIE_VALUE || "default_driver_secret_key_2025");
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const response = NextResponse.json({
    success: true,
    user: payload,
  });

  response.cookies.set("driver_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 nap
  });

  return response;
}