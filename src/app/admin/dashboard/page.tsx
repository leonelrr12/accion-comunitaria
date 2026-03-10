"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { UserPlus, Shield, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUsers } from "@/app/actions/users";
import { getAffiliates } from "@/app/actions/affiliates";

export default function AdminDashboard() {
    const currentUser = useAppStore((state) => state.currentUser);
    const [lideresCount, setLideresCount] = useState(0);
    const [afiliadosCount, setAfiliadosCount] = useState(0);
    const [lideres, setLideres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const dbUsers = await getUsers();
                // En nuestra lógica actual, los líderes son todos menos ADMIN
                const onlyLideres = dbUsers.filter(u => u.role.name !== "ADMIN");
                setLideresCount(onlyLideres.length);
                setLideres(onlyLideres);

                const allAfiliados = await getAffiliates();
                setAfiliadosCount(allAfiliados.length);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-medium tracking-tight">Cargando métricas en tiempo real...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="md:flex md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate flex items-center gap-3">
                        Bienvenido, {currentUser?.name}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Administrador Real
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Consola de administración conectada a la base de datos PostgreSQL.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        href="/admin/dashboard/usuarios"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
                    >
                        <UserPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Gestionar Miembros
                    </Link>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Líderes Activos</p>
                        <p className="text-2xl font-bold text-slate-900">{lideresCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <BarChart3 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Afiliados Globales</p>
                        <p className="text-2xl font-bold text-slate-900">{afiliadosCount}</p>
                    </div>
                </div>
            </div>

            {/* TABLA DE LÍDERES */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
                    <h3 className="font-bold text-slate-900">Directorio de Líderes (Sincronizado)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Líder</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Afiliados</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Suscripción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {lideres.length > 0 ? (
                                lideres.map((lider) => (
                                    <tr key={lider.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                                                    {lider.name?.charAt(0)}{lider.lastName?.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-900">{lider.name} {lider.lastName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                                                {lider.role.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{lider.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-black bg-blue-50 text-blue-700 border border-blue-100">
                                                {lider._count?.persons || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(lider.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                                        No hay líderes registrados en la base de datos real.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
