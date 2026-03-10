"use client";

import { useState, useEffect, useTransition } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { getUserByInviteCode } from "@/app/actions/users";
import { createAffiliate } from "@/app/actions/affiliates";
import { Loader2, CheckCircle, ShieldCheck, Users } from "lucide-react";

function RegistroForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refCode = searchParams.get("ref");
    const [isPending, startTransition] = useTransition();

    const [leader, setLeader] = useState<any | null>(null);
    const [searchingLeader, setSearchingLeader] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        cedula: "",
        phone: "",
        email: "",
        address: "",
        provinceId: "",
        districtId: "",
        corregimientoId: "",
        communityId: "",
    });

    useEffect(() => {
        if (refCode) {
            setSearchingLeader(true);
            getUserByInviteCode(refCode).then(foundLeader => {
                if (foundLeader) {
                    setLeader(foundLeader);
                    // Pre-fill location inheritance
                    setFormData((prev) => ({
                        ...prev,
                        provinceId: foundLeader.provinceId?.toString() || "",
                        districtId: foundLeader.districtId?.toString() || "",
                        corregimientoId: foundLeader.corregimientoId?.toString() || "",
                        communityId: foundLeader.communityId?.toString() || "",
                    }));
                }
                setSearchingLeader(false);
            });
        }
    }, [refCode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!leader) {
            alert("Es requerido un código de líder válido para registrarse.");
            return;
        }

        startTransition(async () => {
            const result = await createAffiliate({
                ...formData,
                leaderUserId: leader.id
            });

            if (result.success) {
                setSuccess(true);
            } else {
                alert("Error: " + result.error);
            }
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 italic">¡Felicidades!</h2>
                        <p className="text-slate-500 font-medium">Te has registrado exitosamente bajo la red de <span className="text-blue-600 font-bold">{leader?.name}</span>.</p>
                    </div>
                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setFormData(prev => ({
                                    ...prev,
                                    name: "",
                                    lastName: "",
                                    cedula: "",
                                    phone: "",
                                    email: "",
                                    address: "",
                                }));
                            }}
                            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                        >
                            <Users className="h-5 w-5" />
                            Registrar a otra persona
                        </button>
                        <button
                            onClick={() => {
                                window.location.href = "about:blank"; // Or a very neutral page
                            }}
                            className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors"
                        >
                            Finalizar Sesión de Registro
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (searchingLeader) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-bold italic">Buscando a tu líder...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 space-y-10">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Formulario de Afiliación</h1>
                    {leader ? (
                        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            <p className="text-sm text-blue-800 font-medium">
                                Inscripción avalada por: <span className="font-black text-blue-900 uppercase tracking-tight">{leader.name} {leader.lastName}</span>
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <p className="text-sm text-red-700 font-bold">Link inválido o expirado. Se requiere un enlace de invitación válido.</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre</label>
                            <input type="text" required className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!leader || isPending} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Apellido</label>
                            <input type="text" required className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} disabled={!leader || isPending} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cédula</label>
                            <input type="text" required placeholder="0-000-0000" className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} disabled={!leader || isPending} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Teléfono</label>
                            <input type="tel" required className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!leader || isPending} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dirección Detallada</label>
                        <input type="text" required className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={!leader || isPending} />
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900 italic">Tu Territorio</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Tu ubicación pre-asignada por el sistema</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                            <LocationSelector
                                provinceId={formData.provinceId}
                                districtId={formData.districtId}
                                corregimientoId={formData.corregimientoId}
                                communityId={formData.communityId}
                                setProvinceId={(val) => setFormData((prev) => ({ ...prev, provinceId: val }))}
                                setDistrictId={(val) => setFormData((prev) => ({ ...prev, districtId: val }))}
                                setCorregimientoId={(val) => setFormData((prev) => ({ ...prev, corregimientoId: val }))}
                                setCommunityId={(val) => setFormData((prev) => ({ ...prev, communityId: val }))}
                                disabled={!leader || isPending}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!leader || isPending}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Mi Afiliación"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function RegistroPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-600" /><p className="mt-2 text-slate-500">Cargando...</p></div>}>
            <RegistroForm />
        </Suspense>
    )
}
