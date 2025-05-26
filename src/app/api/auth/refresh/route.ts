// src/app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, signJWT } from "@/utils/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the current token from cookies
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify the current token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if token is about to expire (less than 10 minutes remaining)
    const expirationTime = payload.exp as number;
    const currentTime = Math.floor(Date.now() / 1000);

    if (expirationTime - currentTime > 600) {
      // Token is still valid for more than 10 minutes
      return NextResponse.json({ valid: true });
    }

    // Generate new token with fresh expiration
    const newToken = await signJWT({
      telegramId: payload.telegramId,
      username: payload.username,
      role: payload.role,
    });

    // Create response with new token in cookie
    const response = NextResponse.json({ valid: true, refreshed: true });

    // Setting cookie with proper object syntax
    response.cookies.set({
      name: "auth_token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check authentication status
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Return user info without sensitive data
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          username: payload.username,
          role: payload.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
