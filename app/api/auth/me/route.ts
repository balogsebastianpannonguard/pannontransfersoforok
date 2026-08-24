import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("driver_auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Nincs bejelentkezve" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.AUTH_COOKIE_VALUE || "default_driver_secret_key_2025");
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({ user: payload });
  } catch (error) {
    return NextResponse.json({ error: "Érvénytelen munkamenet" }, { status: 401 });
  }
}
