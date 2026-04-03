"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { UserPlus, Shield, BarChart3, Loader2, Users, Map, Download } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import MapWrapper from "../../../components/ui/MapWrapper";
import { exportToCSV } from "@/lib/export";
import { toast } from "sonner";
import { getAllUsers } from "../../actions/users";
import { getAllAffiliates } from "../..//actions/affiliates";

type User = {
  id: number;
  role: {
    name: string;
  };
  // agrega aquí otros campos si los tienes
};

export default function AdminDashboard() {
    const currentUser = useAppStore((state) => state.currentUser);
    const [lideresCount, setLideresCount] = useState(0);
    const [afiliadosCount, setAfiliadosCount] = useState(0);
    const [lideres, setLideres] = useState<any[]>([]);
    const [allAfiliadosList, setAllAfiliadosList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const dbUsers = await getAllUsers();
                // En nuestra lógica actual, los líderes son todos menos ADMIN
                const onlyLideres = dbUsers.filter((u: User) => u.role.name !== "ADMIN");
                setLideresCount(onlyLideres.length);
                setLideres(onlyLideres);

                const allAfiliados = await getAllAffiliates();
                setAfiliadosCount(allAfiliados.length);
                setAllAfiliadosList(allAfiliados);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const chartData = useMemo(() => {
        if (!allAfiliadosList || allAfiliadosList.length === 0) return [];
        const counts: Record<string, { fullName: string, count: number }> = {};
        for (const a of allAfiliadosList) {
            const corrName = a.corregimiento?.name || "Sin Asignar";
            
            // Extraer iniciales para el eje X (ej: "Amelia Denis De Icaza" -> "AD")
            let initials = "SA";
            if (corrName !== "Sin Asignar") {
                const words = corrName.split(" ").filter((w: string) => w.length > 0 && !['de', 'el', 'la', 'los', 'las'].includes(w.toLowerCase()));
                if (words.length >= 2) {
                    initials = `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
                } else if (words.length === 1) {
                    initials = words[0].substring(0, 2).toUpperCase();
                }
            }

            if (!counts[initials]) {
                counts[initials] = { fullName: corrName, count: 0 };
            }
            counts[initials].count += 1;
        }
        return Object.entries(counts)
            .map(([name, data]) => ({ name, fullName: data.fullName, count: data.count }))
            .sort((a, b) => b.count - a.count);
    }, [allAfiliadosList]);

    const handleExportGlobalAfiliados = () => {
        if (!allAfiliadosList.length) {
            toast.error("No hay afiliados registrados para exportar.");
            return;
        }
        setIsExporting(true);
        try {
            const headers = [
                { label: "Nombre", key: "name" },
                { label: "Apellido", key: "lastName" },
                { label: "Cédula", key: "cedula" },
                { label: "Email", key: "email" },
                { label: "Teléfono", key: "phone" },
                { label: "Provincia", key: "province.name" },
                { label: "Distrito", key: "district.name" },
                { label: "Corregimiento", key: "corregimiento.name" },
                { label: "Comunidad", key: "community.name" },
                { label: "Fecha Registro", key: "createdAt" },
                { label: "ID Creador", key: "leaderUserId" }
            ];
            exportToCSV(allAfiliadosList, "base_datos_global_afiliados", headers);
            toast.success("Base de datos de afiliados exportada exitosamente.");
        } catch (err) {
            toast.error("Hubo un error al exportar CSV.");
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto w-full p-4 mt-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-8">
                    <div className="h-10 w-1/3 bg-slate-200 rounded-xl animate-pulse"></div>
                    <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
                
                {/* Stats Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center h-28 animate-pulse">
                            <div className="h-12 w-12 bg-slate-200 rounded-xl mr-4"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                <div className="h-8 bg-slate-200 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white p-6 rounded-2xl h-80 shadow-sm border border-gray-100 animate-pulse"></div>
                    <div className="bg-white p-6 rounded-2xl h-80 shadow-sm border border-gray-100 animate-pulse"></div>
                </div>
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
                <div className="mt-4 flex gap-3 md:mt-0 md:ml-4">
                    <button 
                        onClick={handleExportGlobalAfiliados}
                        disabled={isExporting || allAfiliadosList.length === 0}
                        className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" /> : <Download className="-ml-1 mr-2 h-4 w-4 text-emerald-500" />}
                        Exportar BD
                    </button>
                    <Link
                        href="/admin/dashboard/usuarios"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                    >
                        <UserPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Gestionar Miembros
                    </Link>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-blue-200 transition-all cursor-default">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Líderes Activos</p>
                        <p className="text-2xl font-bold text-slate-900">{lideresCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-emerald-200 transition-all cursor-default">
                    <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                        <BarChart3 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Afiliados Totales</p>
                        <p className="text-2xl font-bold text-slate-900">{afiliadosCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-indigo-200 transition-all cursor-default">
                    <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                        <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Ratio Afiliación</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {lideresCount > 0 ? (afiliadosCount / lideresCount).toFixed(1) : 0}
                            <span className="text-xs font-normal text-slate-400 ml-1">af/líd</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ranking de Líderes */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Líderes con Mayor Impacto
                    </h3>
                    <div className="space-y-4">
                        {[...lideres]
                            .sort((a, b) => (b._count?.persons || 0) - (a._count?.persons || 0))
                            .slice(0, 5)
                            .map((lider, idx) => (
                                <div key={lider.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{lider.name} {lider.lastName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{lider.role.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-blue-600">{lider._count?.persons || 0}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Afiliados</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Dashboard Gráfico Mapeo Geográfico */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Map className="h-5 w-5 text-emerald-500" />
                          Corregimiento (San Miguelito)
                        </h4>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Total: {afiliadosCount}
                        </span>
                    </div>

                    <div className="flex-1 min-h-[250px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        tickLine={false} 
                                        axisLine={false} 
                                        fontSize={11}
                                        tick={{ fill: '#64748b', fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        tickLine={false} 
                                        axisLine={false} 
                                        fontSize={11}
                                        tick={{ fill: '#94a3b8' }}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                                        formatter={(value: any) => [<span key="value" className="font-bold text-blue-600">{value}</span>, 'Afiliados']}
                                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#93c5fd'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
                                Sin datos suficientes para mostrar el gráfico.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SECCIÓN: MAPA GEOGRÁFICO INTERACTIVO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6 relative z-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Map className="h-6 w-6 text-emerald-500" />
                            Mapa Geográfico de Cobertura (San Miguelito)
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 font-medium">Visualización de afiliados posicionados en los corregimientos clave.</p>
                    </div>
                </div>
                
                {allAfiliadosList.length > 0 ? (
                    <MapWrapper affiliates={allAfiliadosList} />
                ) : (
                    <div className="h-[400px] w-full rounded-3xl bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-sm">Esperando registros para desplegar el mapa territorial...</p>
                    </div>
                )}
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
