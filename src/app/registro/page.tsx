"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LocationSelector } from "@/components/ui/LocationSelector";

function RegistroForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refCode = searchParams.get("ref");

    const users = useAppStore((state) => state.users);
    const addPerson = useAppStore((state) => state.addPerson);

    const [leader, setLeader] = useState<typeof users[0] | null>(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
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
            const foundLeader = users.find((u) => u.inviteCode === refCode);
            if (foundLeader) {
                setLeader(foundLeader);
                // Pre-fill location inheritance
                setFormData((prev) => ({
                    ...prev,
                    provinceId: foundLeader.provinceId,
                    districtId: foundLeader.districtId,
                    corregimientoId: foundLeader.corregimientoId,
                    communityId: foundLeader.communityId,
                }));
            }
        }
    }, [refCode, users]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (leader) {
            addPerson(formData, leader.id);
            setSuccess(true);
        } else {
            alert("Es requerido un código de líder válido para registrarse.");
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-green-200 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
                    <p className="text-gray-600 mb-6">Te has registrado exitosamente bajo la red de {leader?.name}.</p>
                    <button onClick={() => router.push("/")} className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">Volver al inicio</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Formulario de Registro</h1>
                    {leader ? (
                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                Estás registrándote bajo el liderazgo de:{" "}
                                <span className="font-bold text-blue-900">{leader.name} {leader.lastName}</span>
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">Link inválido. Requiere invitación de un líder.</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} disabled={!leader} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                            <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} disabled={!leader} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="tel" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!leader} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo Electrónico (Opcional)</label>
                            <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!leader} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección Exacta</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={!leader} />
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación Geográfica</h3>
                        <p className="text-sm text-gray-500 mb-4">Tu ubicación ha sido autocompletada basada en tu líder, pero puedes ajustarla si es necesario.</p>
                        <LocationSelector
                            provinceId={formData.provinceId}
                            districtId={formData.districtId}
                            corregimientoId={formData.corregimientoId}
                            communityId={formData.communityId}
                            setProvinceId={(val) => setFormData((prev) => ({ ...prev, provinceId: val }))}
                            setDistrictId={(val) => setFormData((prev) => ({ ...prev, districtId: val }))}
                            setCorregimientoId={(val) => setFormData((prev) => ({ ...prev, corregimientoId: val }))}
                            setCommunityId={(val) => setFormData((prev) => ({ ...prev, communityId: val }))}
                            disabled={!leader}
                        />
                    </div>

                    <button type="submit" disabled={!leader} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Registrarme en la Red
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function RegistroPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando formulario...</div>}>
            <RegistroForm />
        </Suspense>
    )
}
