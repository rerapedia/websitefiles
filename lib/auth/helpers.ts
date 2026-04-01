import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(role: string) {
  const user = await requireAuth();
  if (user.role !== role) throw new Error("Forbidden");
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}
