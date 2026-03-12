import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("session");

    const isAdminRoute = pathname.startsWith("/admin");
    const isDashboardRoute = pathname.startsWith("/dashboard");

    // Si no hay sesión, redirigir a login
    if ((isAdminRoute || isDashboardRoute) && !sessionCookie) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Si hay sesión, verificar el rol para rutas de admin
    if (isAdminRoute && sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            if (session.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        } catch {
            // Cookie malformada → limpiar y redirigir
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("session");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*"],
};
