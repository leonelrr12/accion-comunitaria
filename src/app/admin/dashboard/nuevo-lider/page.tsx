"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { LocationSelector } from "@/components/ui/LocationSelector";

export default function CrearLider() {
    const createLeader = useAppStore((state) => state.createLeader);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        provinceId: "",
        districtId: "",
        corregimientoId: "",
        communityId: "",
    });

    const currentUser = useAppStore((state) => state.currentUser);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Verify that location is fully selected
        if (!formData.provinceId || !formData.districtId || !formData.corregimientoId || !formData.communityId) {
            alert("Por favor, completa toda la ubicación geográfica para el líder.");
            return;
        }

        createLeader(formData, currentUser?.id);
        router.push("/admin/dashboard/usuarios");
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                        Registrar Nuevo Líder Geográfico
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Crea un usuario Líder y asígnale su sector. El Líder podrá entonces invitar afiliados a este mismo sector.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 sm:rounded-2xl sm:p-8">
                <form className="space-y-8 divide-y divide-gray-100" onSubmit={handleSubmit}>
                    <div className="space-y-8 divide-y divide-gray-100">
                        <div>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3 border border-gray-100 rounded-xl p-4 bg-slate-50/50">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Líder</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full bg-white border border-gray-200 text-slate-900 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors shadow-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Juan"
                                    />
                                </div>
                                <div className="sm:col-span-3 border border-gray-100 rounded-xl p-4 bg-slate-50/50">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Apellido</label>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full bg-white border border-gray-200 text-slate-900 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors shadow-sm"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Ej: Pérez"
                                    />
                                </div>
                                <div className="sm:col-span-3 border border-gray-100 rounded-xl p-4 bg-slate-50/50">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        className="appearance-none block w-full bg-white border border-gray-200 text-slate-900 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors shadow-sm"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="juan@email.com"
                                    />
                                </div>
                                <div className="sm:col-span-3 border border-gray-100 rounded-xl p-4 bg-slate-50/50">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                                    <input
                                        type="tel"
                                        required
                                        className="appearance-none block w-full bg-white border border-gray-200 text-slate-900 rounded-lg py-2.5 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors shadow-sm"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="6000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <div>
                                <h3 className="text-lg leading-6 font-semibold text-slate-900">Ubicación Geográfica Restringida</h3>
                                <p className="mt-1 text-sm text-slate-500 mb-6">
                                    El territorio que asignes aquí será propagado obligatoriamente a todos los afiliados que este líder registre.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm shadow-blue-50">
                                <LocationSelector
                                    provinceId={formData.provinceId}
                                    districtId={formData.districtId}
                                    corregimientoId={formData.corregimientoId}
                                    communityId={formData.communityId}
                                    setProvinceId={(val) => setFormData((prev) => ({ ...prev, provinceId: val }))}
                                    setDistrictId={(val) => setFormData((prev) => ({ ...prev, districtId: val }))}
                                    setCorregimientoId={(val) => setFormData((prev) => ({ ...prev, corregimientoId: val }))}
                                    setCommunityId={(val) => setFormData((prev) => ({ ...prev, communityId: val }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-white py-2.5 px-5 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center flex-1 sm:flex-none py-2.5 px-8 border border-transparent shadow-sm shadow-slate-900/20 text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
                            >
                                Registrar y Aprobar Líder
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
