"use client";

import { useAppStore } from "@/lib/store";
import { Copy, Users, TrendingUp, Loader2, Link as LinkIcon, Calendar, UserCheck, QrCode, MessageCircle, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { getAffiliates } from "../actions/affiliates";
import { mapPersonFromDB } from "@/lib/mappers";
import type { Person } from "@/types";

export default function Dashboard() {

    const currentUser = useAppStore((state) => state.currentUser);
    const [myAffiliates, setMyAffiliates] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [inviteUrl, setInviteUrl] = useState("");
    const [showQR, setShowQR] = useState(false);
    const qrRef = useRef<HTMLCanvasElement>(null);

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
        const result = await getAffiliates({ leaderUserId: currentUser?.id });
        const mapped = result.data.map(mapPersonFromDB);
        setMyAffiliates(mapped);
        setLoading(false);
    };

    if (!currentUser) return null;

    const copyToClipboard = () => {
        if (!inviteUrl) return;

        // Modern API (Requires HTTPS)
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(inviteUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => {
                console.error("Error with clipboard API:", err);
                fallbackCopy(inviteUrl);
            });
        } else {
            // Fallback for non-HTTPS or older browsers
            fallbackCopy(inviteUrl);
        }
    };

    const fallbackCopy = (text: string) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            // Prevent scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error("Fallback copy failed:", err);
        }
    };

    const downloadQR = () => {
        const canvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `mi-qr-invitacion.png`;
        a.href = url;
        a.click();
    };

    const shareWhatsApp = () => {
        const msg = encodeURIComponent(`¡Únete a nuestra comunidad! Regístrate aquí: ${inviteUrl}`);
        window.open(`https://wa.me/?text=${msg}`, "_blank");
    };

    // KPI helpers
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const thisWeekCount = myAffiliates.filter(a => new Date(a.createdAt) >= oneWeekAgo).length;
    const thisMonthCount = myAffiliates.filter(a => new Date(a.createdAt) >= oneMonthAgo).length;

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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Tu Link de Invitación</h2>
                        <button
                            onClick={() => setShowQR((v) => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                        >
                            <QrCode className="h-3.5 w-3.5" />
                            {showQR ? "Ocultar QR" : "Ver QR"}
                        </button>
                    </div>

                    <div className="flex rounded-xl shadow-sm overflow-hidden border border-gray-200">
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
                            <span>{copied ? "¡Copiado!" : "Copiar"}</span>
                        </button>
                    </div>

                    {/* Botones de compartir */}
                    <div className="flex gap-2">
                        <button
                            onClick={shareWhatsApp}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Compartir por WhatsApp
                        </button>
                    </div>

                    {/* QR Code */}
                    {showQR && (
                        <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-100">
                            <p className="text-sm font-semibold text-slate-500">Escanea para registrarte</p>
                            <div id="qr-canvas" className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <QRCodeCanvas
                                    value={inviteUrl}
                                    size={180}
                                    level="H"
                                />
                            </div>
                            <button
                                onClick={downloadQR}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Descargar QR
                            </button>
                        </div>
                    )}

                    <p className="text-xs text-slate-400">
                        Las personas que se registren con este link quedarán vinculadas a tu red y a tu ubicación geográfica actual.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Metric 1: Total */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Afiliados</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">{myAffiliates.length}</p>
                    </div>
                </div>

                {/* Metric 2: Este mes */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Este Mes</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">
                            {thisMonthCount}
                            <span className="text-xs font-semibold text-emerald-500 ml-2">nuevos</span>
                        </p>
                    </div>
                </div>

                {/* Metric 3: Esta semana */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-violet-50 rounded-xl">
                        <UserCheck className="h-8 w-8 text-violet-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Esta Semana</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">
                            {thisWeekCount}
                            <span className="text-xs font-semibold text-violet-500 ml-2">nuevos</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Recents Table Minimal */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Registros Recientes
                    </h3>
                    <Link href="/dashboard/afiliados" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
                        Ver Todos
                    </Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {myAffiliates.length > 0 ? (
                        myAffiliates.slice(0, 5).map((affiliate) => (
                            <div key={affiliate.id} className="py-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold group-hover:from-blue-50 group-hover:border-blue-100 transition-all">
                                        {affiliate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{affiliate.name} {affiliate.lastName}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                            <span className="font-medium">{affiliate.cedula}</span>
                                            {affiliate.phone && (
                                                <>
                                                    <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                    <span>{affiliate.phone}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                        Registrado el
                                    </p>
                                    <p className="text-[12px] font-black text-slate-600">
                                        {new Date(affiliate.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 px-6 text-center">
                            <div className="bg-slate-50 h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-300">
                                <LinkIcon className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-slate-500 text-sm font-bold">Aún no tienes afiliados en tu red.</p>
                            <p className="text-slate-400 text-xs mt-1">¡Empieza compartiendo tu link de invitación!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
