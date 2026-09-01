"use client";

// Sincroniza el store con la sesión real (cookie) al cargar la app.
// Sin esto, un store persistido (localStorage) con cookie expirada deja
// las páginas en blanco: el layout cree que hay sesión pero el middleware
// redirige al login, que también cree que hay sesión.
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    const setCurrentUser = useAppStore((state) => state.setCurrentUser);
    const logout = useAppStore((state) => state.logout);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (data?.user) {
                    setCurrentUser(data.user);
                } else {
                    // Cookie inválida/expirada: limpiar el usuario persistido
                    logout();
                }
            })
            .catch(() => {
                // Sin conexión: dejar el estado como está
            });
        return () => {
            cancelled = true;
        };
    }, [setCurrentUser, logout]);

    return <>{children}</>;
}
