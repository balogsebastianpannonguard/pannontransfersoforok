import { connectToDatabase } from "./mongodb";

export interface DirectLoginStaffUser {
  _id: string;
  email: string;
  name?: string;
  role: string;
}

async function hashToken(token: string) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Egy sofőr/admin személyes, jelszó nélküli "egyedi belépő" linkjét keresi ki a
 * megosztott staff_users kollekcióból (ugyanaz a mező/hash-elés, mint a
 * Diszpécser Központ saját direct-login funkciójánál). Nem jár le.
 */
export async function findStaffUserByDirectLoginToken(
  rawToken: string
): Promise<DirectLoginStaffUser | null> {
  if (!rawToken) return null;
  const { db } = await connectToDatabase();
  const hash = await hashToken(rawToken);
  const user = await db.collection("staff_users").findOne({ directLoginTokenHash: hash });
  if (!user) return null;
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
