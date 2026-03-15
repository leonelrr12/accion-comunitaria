"use client";

import { useAppStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, LayoutDashboard, LogOut, Settings, Menu, X, ChevronRight } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

function SidebarContent({
    navigation,
    currentUser,
    onLogout,
    pathname
}: {
    navigation: NavItem[];
    currentUser: { name: string; lastName: string };
    onLogout: () => void;
    pathname: string;
}) {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="bg-blue-600 p-1.5 rounded-lg mr-3">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Comunidad</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                                isActive 
                                    ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            <div className="flex items-center">
                                <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                }`} />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight className="h-4 w-4" />}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                <div className="flex items-center p-2 rounded-2xl bg-white shadow-sm border border-gray-100">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
                            {currentUser.name.charAt(0)}
                        </div>
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">
                            {currentUser.name} {currentUser.lastName}
                        </p>
                        <div
                            className="text-[11px] font-bold text-red-500 hover:text-red-600 cursor-pointer flex items-center mt-0.5 transition-colors uppercase tracking-wider"
                            onClick={onLogout}
                        >
                            <LogOut className="mr-1 h-3 w-3" /> Salir
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentUser = useAppStore((state) => state.currentUser);
    const logout = useAppStore((state) => state.logout);
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (!mounted || !currentUser) {
        return null;
    }

    const navigation: NavItem[] = [
        { name: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Gestión de Afiliados', href: '/dashboard/afiliados', icon: Users },
        { name: 'Mi Configuración', href: '#', icon: Settings },
    ];

    const handleLogout = async () => {
        await logoutAction();
        logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Header (Fixed) */}
            <header className="md:hidden bg-white text-slate-900 h-16 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 border-b border-gray-100 shadow-sm">
                <div className="flex items-center">
                    <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold tracking-tight text-slate-800">Comunidad</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-gray-100"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[60] flex">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="relative w-[280px] bg-white shadow-2xl h-full animate-in slide-in-from-left duration-300">
                        <SidebarContent 
                            navigation={navigation} 
                            currentUser={currentUser} 
                            onLogout={handleLogout}
                            pathname={pathname}
                        />
                    </aside>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:block sticky top-0 h-screen flex-shrink-0 shadow-sm">
                <SidebarContent 
                    navigation={navigation} 
                    currentUser={currentUser} 
                    onLogout={handleLogout}
                    pathname={pathname}
                />
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto mt-16 md:mt-0 pb-20 md:pb-8">
                    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-lg border border-white/50 rounded-2xl shadow-2xl flex items-center justify-around px-2 z-50">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                                isActive ? "text-blue-600 scale-110" : "text-slate-400"
                            }`}
                        >
                            <item.icon className={`h-6 w-6 ${isActive ? "drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]" : ""}`} />
                            <span className={`text-[10px] font-bold mt-1 uppercase ${isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                                {item.name.split(' ')[0]}
                            </span>
                        </Link>
                    );
                })}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center p-2 text-red-400"
                >
                    <LogOut className="h-6 w-6" />
                    <span className="text-[10px] font-bold mt-1 uppercase opacity-0 h-0 overflow-hidden">Salir</span>
                </button>
            </nav>
        </div>
    );
}
