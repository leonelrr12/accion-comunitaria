import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth-utils";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("session");

    // Security headers are set in next.config.ts

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/registro", "/api/auth"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Protected routes
    const isAdminRoute = pathname.startsWith("/admin");
    const isDashboardRoute = pathname.startsWith("/dashboard");

    // Decrypt session
    const session = sessionCookie ? await decrypt(sessionCookie.value) : null;

    // Allow access to password change only if logged in and must change password
    if (pathname.startsWith("/cambiar-password")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (!session.mustChangePassword) {
            return NextResponse.redirect(new URL(session.role === "ADMIN" ? "/admin/dashboard" : "/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // If no session and trying to access protected route
    if ((isAdminRoute || isDashboardRoute) && !session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Force password change for logged in users trying to access protected routes
    if ((isAdminRoute || isDashboardRoute) && session && session.mustChangePassword) {
        return NextResponse.redirect(new URL("/cambiar-password", request.url));
    }

    // If has session, verify role for admin routes
    if (isAdminRoute && session) {
        if (session.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // Prevent logged-in users from accessing the login page
    if (pathname.startsWith("/login") && session) {
        if (session.mustChangePassword) {
            return NextResponse.redirect(new URL("/cambiar-password", request.url));
        }
        if (session.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/login",
        "/registro",
        "/cambiar-password",
    ],
};