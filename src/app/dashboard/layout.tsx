"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, LayoutDashboard, LogOut, Settings } from "lucide-react";

export default function DashboardLayout({
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
            } else if (currentUser.role === "ADMIN") {
                router.push("/admin/dashboard");
            }
        }
    }, [currentUser, mounted, router]);

    if (!mounted || !currentUser) {
        return null; // Prevents hydration errors and unauthenticated flickers
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-blue-600">Red Geográfica</h1>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        <Link
                            href="/dashboard"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-50 hover:text-blue-600 group"
                        >
                            <LayoutDashboard className="mr-3 h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                            Panel de Control
                        </Link>
                        <Link
                            href="/dashboard/afiliados"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-blue-600 group"
                        >
                            <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                            Gestión de Afiliados
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-blue-600 group cursor-not-allowed opacity-50"
                        >
                            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                            Mi Perfil
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {currentUser.name.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">
                                    {currentUser.name} {currentUser.lastName}
                                </p>
                                <div
                                    className="text-xs font-medium text-red-600 hover:text-red-500 cursor-pointer flex items-center mt-1"
                                    onClick={() => {
                                        logout();
                                        router.push("/login");
                                    }}
                                >
                                    <LogOut className="mr-1 h-3 w-3" /> Cerrar Sesión
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col">
                {/* Mobile header could go here */}
                <div className="flex-1 p-8 overflow-y-auto">{children}</div>
            </main>
        </div>
    );
}
