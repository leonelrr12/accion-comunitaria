"use client";

import { useState, useTransition, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { LocationSelector } from "../../../components/ui/LocationSelector";
import { createAffiliate } from "../../actions/affiliates";
import { getAllUsers } from "../../actions/users";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NuevoAfiliado() {
    const router = useRouter();
    const currentUser = useAppStore((state) => state.currentUser);
    const [isPending, startTransition] = useTransition();

    // Form State initialized to leader's location
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        cedula: "",
        phone: "",
        email: "",
        address: "",
        provinceId: currentUser?.provinceId?.toString() || "8",
        districtId: currentUser?.districtId?.toString() || "2",
        corregimientoId: currentUser?.corregimientoId?.toString() || "",
        communityId: currentUser?.communityId?.toString() || "",
        leaderUserId: currentUser?.id?.toString() || "",
    });

    const [availableLeaders, setAvailableLeaders] = useState<any[]>([]);

    useEffect(() => {
        getAllUsers().then(users => {
            setAvailableLeaders(users.filter((u: any) => u.role.name !== "ADMIN"));
        });
    }, []);

    if (!currentUser) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cedula) {
            toast.warning("La cédula es obligatoria.");
            return;
        }

        if (!formData.leaderUserId) {
            toast.warning("El Sponsor o Líder responsable es obligatorio.");
            return;
        }

        startTransition(async () => {
            const result = await createAffiliate({
                ...formData,
                leaderUserId: formData.leaderUserId
            });

            if (result.success) {
                toast.success("Afiliado guardado correctamente");
                router.push("/dashboard/afiliados");
            } else {
                toast.error("Error al guardar: " + result.error);
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver
            </button>

            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                        Registrar Nuevo Afiliado
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Completa los datos del simpatizante. La ubicación se hereda de tu cuenta por defecto.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 sm:p-8">
                <form className="space-y-8 divide-y divide-gray-100" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isPending}
                                    className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apellido</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isPending}
                                    className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cédula / ID</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isPending}
                                    placeholder="0-000-0000"
                                    className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    value={formData.cedula}
                                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                                <input
                                    type="tel"
                                    disabled={isPending}
                                    className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico (Opcional)</label>
                                <input
                                    type="email"
                                    disabled={isPending}
                                    className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="sm:col-span-6 pt-4 border-t border-slate-100">
                                <label className="block text-sm font-black text-blue-700 mb-1.5">Sponsor / Líder a cargo <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    disabled={isPending}
                                    className="w-full bg-blue-50 border border-blue-200 text-slate-900 rounded-xl py-3 px-3 focus:ring-2 focus:ring-blue-500 outline-none font-semibold transition-all shadow-sm"
                                    value={formData.leaderUserId}
                                    onChange={(e) => {
                                        const leaderId = e.target.value;
                                        const leader = availableLeaders.find(l => l.id.toString() === leaderId);
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            leaderUserId: leaderId,
                                            provinceId: leader?.provinceId?.toString() || prev.provinceId,
                                            districtId: leader?.districtId?.toString() || prev.districtId,
                                            corregimientoId: leader?.corregimientoId?.toString() || prev.corregimientoId,
                                            communityId: leader?.communityId?.toString() || prev.communityId,
                                        }));
                                    }}
                                >
                                    <option value="" disabled>Selecciona al Sponsor Obligatorio</option>
                                    {availableLeaders.map(lider => (
                                        <option key={lider.id} value={lider.id}>
                                            {lider.name} {lider.lastName} ({lider.role.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Ubicación Asignada
                                {currentUser.provinceId && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-100">
                                        ✓ Pre-rellenada desde tu cuenta
                                    </span>
                                )}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 mb-6">
                                El afiliado quedará registrado en este sector. Puedes modificarlo si es necesario.
                            </p>
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <LocationSelector
                                provinceId={formData.provinceId}
                                districtId={formData.districtId}
                                corregimientoId={formData.corregimientoId}
                                communityId={formData.communityId}
                                setProvinceId={(val) => setFormData((prev) => ({ ...prev, provinceId: val }))}
                                setDistrictId={(val) => setFormData((prev) => ({ ...prev, districtId: val }))}
                                setCorregimientoId={(val) => setFormData((prev) => ({ ...prev, corregimientoId: val }))}
                                setCommunityId={(val) => setFormData((prev) => ({ ...prev, communityId: val }))}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar Afiliado"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
