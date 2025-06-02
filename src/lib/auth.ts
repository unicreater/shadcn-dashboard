import { verifyToken as utilsVerifyToken } from "@/utils/auth";
import { UserPayload } from "@/components/model/model";

/**
 * Compatibility wrapper for verifyToken to handle type differences
 * Converts string | undefined to string | null for consistency
 */
export async function validateToken(
  token: string | undefined
): Promise<UserPayload | null> {
  // Convert undefined to null for type compatibility
  const normalizedToken = token ?? null;
  const payload = await utilsVerifyToken(normalizedToken);

  return payload;
}

/**
 * Alternative function name for consistency with existing code
 */
export async function verifyToken(
  token: string | undefined
): Promise<UserPayload | null> {
  return await validateToken(token);
}

/**
 * Extract token from Authorization header
 * Handles "Bearer token" format
 */
export function extractTokenFromHeader(
  authHeader: string | undefined
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] || null;
}

/**
 * Comprehensive token validation with header extraction
 * Use this in API routes for complete authentication
 */
export async function authenticateRequest(
  authHeader: string | undefined
): Promise<UserPayload | null> {
  try {
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return null;
    }

    return await validateToken(token);
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
