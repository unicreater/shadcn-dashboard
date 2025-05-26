// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Interface for the JWT payload
interface TokenPayload {
  telegramId: number;
  username: string;
  role: string;
  exp?: number;
  iat?: number;
}

// Verify token function for middleware
async function verifyToken(token: string): Promise<TokenPayload | null> {
  if (!process.env.JWT_SECRET) {
    console.log("[Middleware] Missing JWT_SECRET environment variable");
    return null;
  }

  try {
    // Jose requires a Uint8Array for the secret
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    // Verify that the token contains the required fields
    if (!payload.telegramId || !payload.role) {
      console.log(
        "[Middleware] Token validation failed: Missing required fields"
      );
      return null;
    }

    return payload as unknown as TokenPayload;
  } catch (error) {
    console.log("[Middleware] Token validation error:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  console.log("[Middleware] Executing for path:", request.nextUrl.pathname);

  // Check if it's a dashboard route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    console.log("[Middleware] Processing dashboard route");

    // For the initial access with token in query parameter
    if (
      request.nextUrl.pathname === "/dashboard" &&
      request.nextUrl.searchParams.has("token")
    ) {
      console.log("[Middleware] Processing initial token in URL");
      const token = request.nextUrl.searchParams.get("token");

      // If no token or token is null, redirect to unauthorized
      if (!token) {
        console.log("[Middleware] No token found in URL");
        return NextResponse.redirect(
          new URL("/auth/unauthorized", request.url)
        );
      }

      // Verify the token
      const payload = await verifyToken(token);
      if (!payload) {
        console.log("[Middleware] Invalid token in URL");
        return NextResponse.redirect(
          new URL("/auth/unauthorized", request.url)
        );
      }

      console.log("[Middleware] Valid token, setting cookie and redirecting");

      // Set the token as a cookie and redirect to remove the token from URL (for security)
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );

      // Setting cookie with proper type handling
      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
      });

      return response;
    }

    // For subsequent requests, check the cookie
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      console.log("[Middleware] No auth_token cookie found");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    console.log("[Middleware] Verifying token from cookie");
    const payload = await verifyToken(token);
    if (!payload) {
      console.log("[Middleware] Invalid token in cookie");
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url));
    }

    // Role-based access control
    if (
      payload.role !== "admin" &&
      payload.role !== "super_admin" &&
      payload.role !== "inventory_admin" &&
      payload.role !== "order_admin" &&
      payload.role !== "finance_admin"
    ) {
      console.log("[Middleware] Unauthorized role:", payload.role);
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url));
    }

    console.log(
      "[Middleware] User authenticated:",
      payload.username,
      "Role:",
      payload.role
    );

    // Add user info to request headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.telegramId.toString());
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-name", payload.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Apply security headers to all responses
  const response = NextResponse.next();

  // Security headers based on our Project Bible security framework
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:; " +
      "font-src 'self'; " +
      "connect-src 'self' " +
      process.env.NEXT_PUBLIC_API_URL +
      "; " +
      "frame-ancestors 'none'; " +
      "form-action 'self'; " +
      "base-uri 'self';"
  );

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
