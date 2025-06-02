import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Enhanced interface for JWT payload
interface TokenPayload {
  telegramId: number;
  username: string;
  role: string;
  agentId?: string;
  agentCode?: string;
  exp?: number;
  iat?: number;
  sessionId?: string;
}

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // requests per window
  cookieMaxAge: 60 * 60, // 1 hour
  csrfTokenLength: 32,
};

// Allowed roles for dashboard access
const ALLOWED_ROLES = [
  "admin",
  "super_admin",
  "inventory_admin",
  "order_admin",
  "finance_admin",
];

/**
 * Enhanced token verification with comprehensive validation
 */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  if (!process.env.JWT_SECRET) {
    console.error("[Middleware] Missing JWT_SECRET environment variable");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Enhanced validation
    if (!payload.telegramId || !payload.role || !payload.username) {
      console.warn(
        "[Middleware] Token validation failed: Missing required fields",
        {
          hasTelegramId: !!payload.telegramId,
          hasRole: !!payload.role,
          hasUsername: !!payload.username,
        }
      );
      return null;
    }

    // Check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.warn("[Middleware] Token expired");
      return null;
    }

    return payload as unknown as TokenPayload;
  } catch (error) {
    console.error("[Middleware] Token validation error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      tokenLength: token?.length || 0,
    });
    return null;
  }
}

/**
 * Rate limiting implementation
 */
function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const key = `rate_limit:${clientIp}`;

  // Clean up expired entries
  if (rateLimitStore.size > 10000) {
    // Prevent memory leak
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.rateLimitWindow,
    });
    return true;
  }

  if (current.count >= SECURITY_CONFIG.rateLimitMax) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Generate CSRF token
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(SECURITY_CONFIG.csrfTokenLength);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Security logging function
 */
function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  request: NextRequest
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  console.log(`[Security][${event}]`, {
    timestamp: new Date().toISOString(),
    clientIp,
    userAgent,
    path: request.nextUrl.pathname,
    ...details,
  });
}

/**
 * Enhanced middleware function
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";
  const path = request.nextUrl.pathname;

  console.log(
    `[Middleware] Processing: ${request.method} ${path} from ${clientIp}`
  );

  // Rate limiting check
  if (!checkRateLimit(clientIp)) {
    logSecurityEvent("RATE_LIMIT_EXCEEDED", { clientIp }, request);
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "900", // 15 minutes
        "X-RateLimit-Limit": SECURITY_CONFIG.rateLimitMax.toString(),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  // Dashboard authentication flow
  if (path.startsWith("/dashboard")) {
    console.log("[Middleware] Processing dashboard route");

    // Handle initial token in URL parameter
    if (path === "/dashboard" && request.nextUrl.searchParams.has("token")) {
      console.log("[Middleware] Processing initial token in URL");
      const token = request.nextUrl.searchParams.get("token");

      if (!token) {
        logSecurityEvent("MISSING_TOKEN_IN_URL", { path }, request);
        return NextResponse.redirect(
          new URL("/auth/unauthorized", request.url)
        );
      }

      // Verify the token
      const payload = await verifyToken(token);
      if (!payload) {
        logSecurityEvent(
          "INVALID_TOKEN_IN_URL",
          { tokenLength: token.length },
          request
        );
        return NextResponse.redirect(
          new URL("/auth/unauthorized", request.url)
        );
      }

      // Role validation
      if (!ALLOWED_ROLES.includes(payload.role)) {
        logSecurityEvent(
          "UNAUTHORIZED_ROLE_ACCESS",
          {
            role: payload.role,
            username: payload.username,
          },
          request
        );
        return NextResponse.redirect(
          new URL("/auth/unauthorized", request.url)
        );
      }

      console.log("[Middleware] Valid token, setting secure cookies");

      // Generate CSRF token
      const csrfToken = generateCSRFToken();

      // Set secure cookies and redirect
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );

      // Enhanced cookie security
      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: SECURITY_CONFIG.cookieMaxAge,
        path: "/",
      });

      // Set CSRF token cookie
      response.cookies.set({
        name: "csrf_token",
        value: csrfToken,
        httpOnly: false, // Accessible to JavaScript for form submissions
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: SECURITY_CONFIG.cookieMaxAge,
        path: "/",
      });

      logSecurityEvent(
        "SUCCESSFUL_LOGIN",
        {
          username: payload.username,
          role: payload.role,
          telegramId: payload.telegramId,
        },
        request
      );

      return response;
    }

    // Validate existing session
    const token = request.cookies.get("auth_token")?.value;
    const csrfToken = request.cookies.get("csrf_token")?.value;

    if (!token) {
      console.log("[Middleware] No auth_token cookie found");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Verify token from cookie
    console.log("[Middleware] Verifying token from cookie");
    const payload = await verifyToken(token);
    if (!payload) {
      logSecurityEvent(
        "INVALID_TOKEN_IN_COOKIE",
        { hasToken: !!token },
        request
      );

      // Clear invalid cookies
      const response = NextResponse.redirect(
        new URL("/auth/unauthorized", request.url)
      );
      response.cookies.delete("auth_token");
      response.cookies.delete("csrf_token");
      return response;
    }

    // Enhanced role validation
    if (!ALLOWED_ROLES.includes(payload.role)) {
      logSecurityEvent(
        "UNAUTHORIZED_ROLE_ACCESS",
        {
          role: payload.role,
          username: payload.username,
        },
        request
      );
      return NextResponse.redirect(new URL("/auth/unauthorized", request.url));
    }

    // CSRF protection for state-changing requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const headerCSRF = request.headers.get("x-csrf-token");
      const bodyCSRF = request.nextUrl.searchParams.get("_csrf");

      if (
        !csrfToken ||
        (!headerCSRF && !bodyCSRF) ||
        (headerCSRF !== csrfToken && bodyCSRF !== csrfToken)
      ) {
        logSecurityEvent(
          "CSRF_TOKEN_MISMATCH",
          {
            method: request.method,
            hasCSRFCookie: !!csrfToken,
            hasCSRFHeader: !!headerCSRF,
          },
          request
        );
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    console.log(
      `[Middleware] User authenticated: ${payload.username} (${payload.role})`
    );

    // Add comprehensive user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.telegramId.toString());
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-name", payload.username);
    requestHeaders.set("x-agent-id", payload.agentId || "");
    requestHeaders.set("x-agent-code", payload.agentCode || "");
    requestHeaders.set("x-session-start", Date.now().toString());

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Add session monitoring headers
    response.headers.set("X-Session-Valid", "true");
    response.headers.set("X-User-Role", payload.role);

    return response;
  }

  // API routes authentication
  if (path.startsWith("/api/") && !path.startsWith("/api/auth/")) {
    // Validate existing session
    const token = request.cookies.get("auth_token")?.value;
    const csrfToken = request.cookies.get("csrf_token")?.value;

    if (!token) {
      console.log("[Middleware] No auth_token cookie found");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`test2`);

    // const token = authHeader!.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      logSecurityEvent("API_INVALID_TOKEN", { path }, request);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Add user context to API requests
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

  // Enhanced security headers for all responses
  const response = NextResponse.next();

  // Core security headers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // Enhanced Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || ""),
    "media-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ];

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  // Add performance and security monitoring headers
  const processingTime = Date.now() - startTime;
  response.headers.set("X-Response-Time", `${processingTime}ms`);
  response.headers.set("X-Request-ID", crypto.randomUUID());

  // Add rate limiting info
  const remaining =
    SECURITY_CONFIG.rateLimitMax -
    (rateLimitStore.get(`rate_limit:${clientIp}`)?.count || 0);
  response.headers.set(
    "X-RateLimit-Limit",
    SECURITY_CONFIG.rateLimitMax.toString()
  );
  response.headers.set(
    "X-RateLimit-Remaining",
    Math.max(0, remaining).toString()
  );

  console.log(
    `[Middleware] Completed: ${request.method} ${path} (${processingTime}ms)`
  );

  return response;
}

// Enhanced matcher configuration
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/((?!auth).*)", // All API routes except auth
    "/((?!api|_next/static|_next/image|favicon.ico|images|auth/login|auth/unauthorized).*)",
  ],
};
