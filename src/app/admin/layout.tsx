"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Shield, LogOut, ShieldCheck, BarChart3, MapPin, Network, Menu, X, Sparkles } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

function SidebarContent({
    navigation,
    currentUser,
    onLogout
}: {
    navigation: NavItem[];
    currentUser: { name: string; lastName: string };
    onLogout: () => void;
}) {
    return (
        <div className="h-full flex flex-col bg-slate-900">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                <ShieldCheck className="text-blue-500 mr-2 h-6 w-6" />
                <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white group transition-colors"
                    >
                        <item.icon className={`mr-3 h-5 w-5 text-slate-400 ${item.color}`} />
                        {item.name}
                    </Link>
                ))}
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
                            onClick={onLogout}
                        >
                            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Cerrar Sesión
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentUser = useAppStore((state) => state.currentUser);
    const logout = useAppStore((state) => state.logout);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const navigation: NavItem[] = [
        { name: 'Panel General', href: '/admin/dashboard', icon: BarChart3, color: 'group-hover:text-blue-400' },
        { name: 'Asistente IA', href: '/admin/dashboard/asistente', icon: Sparkles, color: 'group-hover:text-purple-400' },
        { name: 'Estructura Geográfica', href: '/admin/dashboard/geografia', icon: MapPin, color: 'group-hover:text-emerald-400' },
        { name: 'Jerarquía de Liderazgo', href: '/admin/dashboard/jerarquia', icon: Network, color: 'group-hover:text-blue-400' },
        { name: 'Configurar Roles', href: '/admin/dashboard/roles', icon: Shield, color: 'group-hover:text-indigo-400' },
        { name: 'Gestión de Usuarios', href: '/admin/dashboard/usuarios', icon: Users, color: 'group-hover:text-blue-400' },
    ];

    const handleLogout = async () => {
        await logoutAction();
        logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Header (Fixed) */}
            <header className="md:hidden bg-slate-900 text-white h-16 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 border-b border-slate-800 shadow-lg">
                <div className="flex items-center">
                    <ShieldCheck className="text-blue-500 mr-2 h-6 w-6" />
                    <span className="font-bold tracking-tight">Admin</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 active:scale-95"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[60] flex">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="relative w-[280px] bg-slate-900 text-white shadow-2xl h-full animate-in slide-in-from-left duration-300 border-r border-slate-800">
                        <SidebarContent navigation={navigation} currentUser={currentUser} onLogout={handleLogout} />
                    </aside>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:block text-white sticky top-0 h-screen flex-shrink-0 shadow-xl">
                <SidebarContent navigation={navigation} currentUser={currentUser} onLogout={handleLogout} />
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto mt-16 md:mt-0 pb-20 md:pb-0">
                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {navigation.slice(0, 5).map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <item.icon className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-bold uppercase truncate max-w-[60px]">{item.name.split(' ')[0]}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}