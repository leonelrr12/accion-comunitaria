"use client";

import { useAppStore } from "@/lib/store";
import { Copy, Users, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAffiliates } from "@/app/actions/affiliates";

export default function Dashboard() {

    const currentUser = useAppStore((state) => state.currentUser);
    const [myAffiliates, setMyAffiliates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [inviteUrl, setInviteUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined" && currentUser?.inviteCode) {
            setInviteUrl(`${window.location.origin}/registro?ref=${currentUser.inviteCode}`);
        } else {
            setInviteUrl("");
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            loadDashboardData();
        }
    }, [currentUser]);

    const loadDashboardData = async () => {
        setLoading(true);
        const data = await getAffiliates({ leaderUserId: currentUser?.id });
        setMyAffiliates(data.data);
        setLoading(false);
    };

    if (!currentUser) return null;

    const copyToClipboard = () => {
        if (typeof navigator !== "undefined") {
            navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Cargando tu resumen de red...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">
                    Hola, {currentUser.name} {currentUser.lastName}
                </h1>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
                    {currentUser.role}
                </span>
            </div>

            {inviteUrl && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        Tu Link de Invitación Personalizado
                    </h2>
                    <div className="flex mt-1 rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                readOnly
                                className="block w-full sm:text-sm border-none bg-slate-50 px-4 py-3 text-slate-600 font-mono"
                                value={inviteUrl}
                            />
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="relative inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-all border-none"
                        >
                            <Copy className="h-4 w-4" />
                            <span>{copied ? "¡Copiado!" : "Copiar Link"}</span>
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                        Las personas que se registren con este link quedarán vinculadas a tu red y a tu ubicación geográfica actual.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Metric 1 */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Afiliados</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">{myAffiliates.length}</p>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Crecimiento Red</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">{myAffiliates.length}</p>
                    </div>
                </div>
            </div>

            {/* Recents Table Minimal */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                        Registros Recientes
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {Array.isArray(myAffiliates) ? (
                        myAffiliates.slice(0, 5).map((affiliate) => (
                            <div key={affiliate.id} className="py-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {affiliate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{affiliate.name} {affiliate.lastName}</p>
                                        <p className="text-xs text-slate-500">{affiliate.phone || affiliate.cedula}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {new Date(affiliate.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 px-6 text-center text-slate-500 text-sm font-medium">
                            Aún no tienes afiliados en tu red. ¡Empieza compartiendo tu link!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
