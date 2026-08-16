import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth-utils";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("session");

    // Security headers are set in next.config.ts

    // Public routes that don't require authentication
    // const publicRoutes = ["/login", "/registro", "/api/auth"];
    // const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Protected routes
    const isAdminRoute = pathname.startsWith("/admin");
    const isDashboardRoute = pathname.startsWith("/dashboard");

    // Decrypt session
    //console.log("Cookie encontrada:", !!sessionCookie);
    const session = sessionCookie ? await decrypt(sessionCookie.value) : null;
    //console.log("Sesión decodificada:", !!session);

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

    // NOTA: se eliminó el rebote de /login para usuarios con sesión.
    // Las sesiones son estáticas y sobreviven al cambio de contraseña: si un
    // usuario tenía una cookie vieja, el rebote lo dejaba atrapado sin poder
    // llegar al formulario. Ahora /login siempre muestra el formulario; la
    // protección real sigue en las rutas /admin y /dashboard.

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