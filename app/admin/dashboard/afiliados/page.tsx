"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Loader2, Search } from "lucide-react";
import { getAllAffiliates } from "../../../actions/affiliates";

interface Affiliado {
    id: number;
    name: string;
    lastName: string;
    cedula: string;
    phone?: string | null;
    leaderUserId?: number | null;
    leader?: { name: string; lastName: string } | null;
    province?: { name: string } | null;
    district?: { name: string } | null;
    corregimiento?: { name: string } | null;
    community?: { name: string } | null;
}

export default function AdminAfiliadosPage() {
    const [afiliados, setAfiliados] = useState<Affiliado[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getAllAffiliates().then((data) => {
            setAfiliados(data);
            setLoading(false);
        });
    }, []);

    const filtered = afiliados.filter((a) =>
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.lastName.toLowerCase().includes(search.toLowerCase()) ||
        a.cedula.includes(search)
    );

    const locationText = (a: Affiliado) =>
        [a.province?.name, a.district?.name, a.corregimiento?.name, a.community?.name].filter(Boolean).join(" › ");

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Gestión de Afiliados</h1>
                        <p className="text-sm text-slate-500">Todos los afiliados del movimiento y su ubicación</p>
                    </div>
                </div>
                <Link
                    href="/admin/dashboard/nuevo-afiliado"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all"
                >
                    <UserPlus className="h-4 w-4" />
                    Registrar Afiliado
                </Link>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o cédula..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        {search ? "Sin resultados para la búsqueda." : "Aún no hay afiliados registrados."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cédula</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Líder</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-semibold text-slate-900 whitespace-nowrap">
                                            {a.name} {a.lastName}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{a.cedula}</td>
                                        <td className="px-6 py-3 text-slate-600 whitespace-nowrap">
                                            {a.leader ? `${a.leader.name} ${a.leader.lastName}` : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-slate-500">{locationText(a) || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
