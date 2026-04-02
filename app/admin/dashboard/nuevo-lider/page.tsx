"use client";

import { useState, useTransition, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { LocationSelector } from "../../../../components/ui/LocationSelector";
import { createUserAction, getAllUsers } from "../../../actions/users";
import { Loader2, MapPin, Network, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CrearLider() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        provinceId: "8",    // Panamá
        districtId: "2",    // San Miguelito
        corregimientoId: "",
        communityId: "",
        role: "Lider de Zona",
        parentLeaderId: ""
    });

    const [availableLeaders, setAvailableLeaders] = useState<any[]>([]);

    useEffect(() => {
        getAllUsers().then(users => {
            setAvailableLeaders(users.filter((u: any) => u.role.name !== "ADMIN"));
        });
    }, []);

    const currentUser = useAppStore((state) => state.currentUser);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Verify that location is fully selected
        if (!formData.provinceId || !formData.districtId || !formData.corregimientoId || !formData.communityId) {
            toast.warning("Por favor, completa toda la ubicación geográfica para el líder.");
            return;
        }

        startTransition(async () => {
            const result = await createUserAction({
                ...formData,
                createdBy: currentUser?.id
            });

            if (result.success) {
                if (result.tempPassword) {
                    toast.success(`Líder registrado. Clave temporal: ${result.tempPassword}`, { duration: 20000 });
                } else {
                    toast.success("Líder registrado correctamente");
                }
                router.push("/admin/dashboard/usuarios");
            } else {
                toast.error("Error: " + result.error);
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
                        Registrar Nuevo Líder Geográfico
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Los datos se guardarán directamente en la base de datos real.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sección 1: Datos de Usuario */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nombre</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Apellido</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Rol Asignado</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-600"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    disabled={isPending}
                                >
                                    <option value="Lider Regional">Lider Regional</option>
                                    <option value="Lider de Zona">Lider de Zona</option>
                                    <option value="Comunitario">Comunitario</option>
                                    <option value="Activista">Activista</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Teléfono</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <Network className="h-4 w-4" />
                                    Líder Superior
                                </label>
                                <select
                                    className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.parentLeaderId}
                                    onChange={(e) => setFormData({ ...formData, parentLeaderId: e.target.value })}
                                    disabled={isPending}
                                >
                                    <option value="">Líder Principal (Nivel 0)</option>
                                    {availableLeaders
                                        .filter((u: any) => u.role.name !== "ADMIN")
                                        .filter((u: any) => {
                                            if (u.role.name === "Activista") return false;
                                            if (u.role.name === "Comunitario" && formData.role !== "Activista") return false;
                                            return true;
                                        })
                                        .map((u: any) => (
                                            <option key={u.id} value={u.id}>{u.name} {u.lastName} ({u.role.name})</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Ubicación Geográfica */}
                    <div className="pt-8 border-t border-gray-100">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-emerald-500" />
                                Ubicación Geográfica
                            </h3>
                            <p className="text-sm text-slate-500">Asigna el territorio de operación para este líder.</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
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

                    {/* Botones de Acción */}
                    <div className="pt-8 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-black shadow-lg shadow-slate-200 hover:bg-black transition-all flex justify-center items-center gap-2"
                        >
                            {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                            Registrar Líder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}