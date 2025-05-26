// src/utils/auth.ts

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

interface UserPayload {
  telegramId: number;
  username: string;
  role: string;
  exp?: number;
  iat?: number;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(
  token: string | null
): Promise<UserPayload | null> {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Verify that the token contains the required fields
    if (!payload.telegramId || !payload.role) {
      console.error("Token missing required fields");
      return null;
    }

    return payload as unknown as UserPayload;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Sign a new JWT token
 */
export async function signJWT(payload: UserPayload): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return await new SignJWT({
    ...payload,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

/**
 * Get the current authenticated user from the request
 */
export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Check if the current user has the required role
 */
export async function checkUserRole(requiredRoles: string[]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) return false;

  return requiredRoles.includes(user.role);
}

/**
 * Check if the authentication token is about to expire
 * Returns true if token will expire within the next 10 minutes
 */
export async function isTokenExpiringSoon(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user || !user.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = user.exp - currentTime;

  // Return true if token expires in less than 10 minutes
  return timeUntilExpiry < 600;
}
