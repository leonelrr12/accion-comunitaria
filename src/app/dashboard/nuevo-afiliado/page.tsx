"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { LocationSelector } from "@/components/ui/LocationSelector";

export default function NuevoAfiliado() {
    const router = useRouter();
    const currentUser = useAppStore((state) => state.currentUser);
    const addPerson = useAppStore((state) => state.addPerson);

    // Form State initialized to leader's location
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        provinceId: currentUser?.provinceId || "",
        districtId: currentUser?.districtId || "",
        corregimientoId: currentUser?.corregimientoId || "",
        communityId: currentUser?.communityId || "",
    });

    if (!currentUser) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addPerson(formData, currentUser.id);
        router.push("/dashboard/afiliados");
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Registrar Nuevo Afiliado
                    </h2>
                </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-gray-200">
                <form className="space-y-8 divide-y divide-gray-200" onSubmit={handleSubmit}>
                    <div className="space-y-8 divide-y divide-gray-200">
                        <div>
                            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <div className="mt-1">
                                        <input type="text" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                    <div className="mt-1">
                                        <input type="text" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <div className="mt-1">
                                        <input type="tel" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                    <div className="mt-1">
                                        <input type="email" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                    <div className="mt-1">
                                        <input type="text" required className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Ubicación Geográfica
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Por defecto se auto-selecciona tú misma ubicación.
                                </p>
                            </div>
                            <div className="mt-6">
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

                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Guardar Afiliado
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
