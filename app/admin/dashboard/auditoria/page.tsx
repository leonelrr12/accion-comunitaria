"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Loader2, Activity, ArrowLeft } from "lucide-react";
import { getAuditLogs } from "../../../actions/audit";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuditLog() {
    const router = useRouter();
    const currentUser = useAppStore((state) => state.currentUser);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await getAuditLogs(100); // 100 recent records
            setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    if (!currentUser || currentUser.role !== "ADMIN") {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-500 font-medium">Accesibilidad denegada.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver
            </button>

            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-indigo-600" />
                        Audit Log (Trazabilidad)
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Registro inmutable de las operaciones críticas realizadas en la plataforma.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-3">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                        <p className="text-sm text-slate-400 font-medium">Recuperando registros...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario / Roles</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.user ? (
                                                <div>
                                                    <span className="font-semibold text-slate-900 text-sm">
                                                        {log.user.name} {log.user.lastName}
                                                    </span>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{log.user.role.name}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400 font-medium italic">Sistema / Público</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 font-mono text-[10px] font-bold rounded-lg uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                            No hay registros de auditoría aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
