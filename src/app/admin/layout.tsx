"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Shield, LogOut, ShieldCheck, BarChart3, MapPin, Network } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentUser = useAppStore((state) => state.currentUser);
    const logout = useAppStore((state) => state.logout);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            if (!currentUser) {
                router.push("/login");
            } else if (currentUser.role !== "ADMIN") {
                router.push("/dashboard");
            }
        }
    }, [currentUser, mounted, router]);

    if (!mounted || !currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:block text-white">
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                        <ShieldCheck className="text-blue-500 mr-2 h-6 w-6" />
                        <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white group transition-colors"
                        >
                            <BarChart3 className="mr-3 h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                            Panel General
                        </Link>
                        <Link
                            href="/admin/dashboard/roles"
                            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white group transition-colors"
                        >
                            <Shield className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-400" />
                            Configurar Roles/CRUD
                        </Link>
                        <Link
                            href="/admin/dashboard/usuarios"
                            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white group transition-colors"
                        >
                            <Users className="mr-3 h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                            Gestión de Usuarios
                        </Link>
                        <Link
                            href="/admin/dashboard/geografia"
                            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white group transition-colors"
                        >
                            <MapPin className="mr-3 h-5 w-5 text-slate-400 group-hover:text-emerald-400" />
                            Estructura Geográfica
                        </Link>
                        <Link
                            href="/admin/dashboard/jerarquia"
                            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white group transition-colors"
                        >
                            <Network className="mr-3 h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                            Jerarquía de Liderazgo
                        </Link>
                    </nav>
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {currentUser.name.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-white">
                                    {currentUser.name} {currentUser.lastName}
                                </p>
                                <div
                                    className="text-xs font-medium text-red-400 hover:text-red-300 cursor-pointer flex items-center mt-1 transition-colors"
                                    onClick={() => {
                                        logout();
                                        router.push("/login");
                                    }}
                                >
                                    <LogOut className="mr-1.5 h-3.5 w-3.5" /> Cerrar Sesión
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 p-8 overflow-y-auto">{children}</div>
            </main>
        </div>
    );
}
