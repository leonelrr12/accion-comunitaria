import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("session");

    // Security headers are set in next.config.ts

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/registro", "/api/auth"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Protected routes
    const isAdminRoute = pathname.startsWith("/admin");
    const isDashboardRoute = pathname.startsWith("/dashboard");

    // If no session and trying to access protected route
    if ((isAdminRoute || isDashboardRoute) && !sessionCookie) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If has session, verify role for admin routes
    if (isAdminRoute && sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            if (session.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        } catch {
            // Malformed cookie → clear and redirect
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("session");
            return response;
        }
    }

    // Prevent logged-in users from accessing login/registro pages
    if (isPublicRoute && sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            if (session.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            }
            return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch {
            // Invalid session, let them through
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/login",
        "/registro",
    ],
};