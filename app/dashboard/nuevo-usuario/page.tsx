"use client";

import { useState, useTransition, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { LocationSelector } from "../../../components/ui/LocationSelector";
import { getRoles } from "../../actions/roles";
import { createUserAction } from "../../actions/users";
import { Loader2, UserPlus, ShieldAlert, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NuevoUsuario() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const currentUser = useAppStore((state) => state.currentUser);

    const [roles, setRoles] = useState<any[]>([]);
    const [creatableRoles, setCreatableRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        provinceId: "8",    // Panamá
        districtId: "2",    // San Miguelito
        corregimientoId: "",
        communityId: "",
        role: "",
    });

    useEffect(() => {
        getRoles().then((all: any[]) => {
            setRoles(all);
            const myRole = all.find((r: any) => r.name === currentUser?.role);
            if (myRole) {
                // Solo puede crear roles de nivel inferior (nivel MAYOR numéricamente)
                const allowed = all
                    .filter((r: any) => r.level > myRole.level)
                    .sort((a: any, b: any) => a.level - b.level);
                setCreatableRoles(allowed);
                setFormData((prev) => ({ ...prev, role: allowed[0]?.name || "" }));
            }
        });
    }, [currentUser?.role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role) {
            toast.warning("Tu rol no permite crear usuarios.");
            return;
        }

        // Validation: ubicación geográfica completa
        if (!formData.provinceId || !formData.districtId || !formData.corregimientoId || !formData.communityId) {
            toast.warning("Por favor, completa toda la ubicación geográfica.");
            return;
        }

        startTransition(async () => {
            const result = await createUserAction({
                ...formData,
                createdBy: currentUser?.id,
            });

            if (result.success) {
                toast.success("Usuario creado. Se envió el correo con el enlace para definir su contraseña.", { duration: 8000 });
                router.push("/dashboard");
            } else {
                toast.error(result.error || "Error al crear el usuario");
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft className="h-3.5 w-3.5" /> Volver al dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Nuevo usuario</h1>
                        <p className="text-sm text-slate-500">
                            Crea un usuario con un rol inferior al tuyo ({currentUser?.role})
                        </p>
                    </div>
                </div>

                {creatableRoles.length === 0 ? (
                    <div className="text-center py-8">
                        <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                        <p className="text-slate-700 font-medium">Tu rol no permite crear usuarios</p>
                        <p className="text-sm text-slate-500 mt-1">Los Activistas no pueden crear nuevos usuarios.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                                <input
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Apellido"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rol a crear</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                            >
                                {creatableRoles.map((r: any) => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400 mt-1">
                                Solo puedes crear roles inferiores al tuyo. El usuario quedará bajo tu liderazgo.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación geográfica</label>
                            <LocationSelector
                                provinceId={formData.provinceId}
                                districtId={formData.districtId}
                                corregimientoId={formData.corregimientoId}
                                communityId={formData.communityId}
                                setProvinceId={(v) => setFormData((p) => ({ ...p, provinceId: v }))}
                                setDistrictId={(v) => setFormData((p) => ({ ...p, districtId: v }))}
                                setCorregimientoId={(v) => setFormData((p) => ({ ...p, corregimientoId: v }))}
                                setCommunityId={(v) => setFormData((p) => ({ ...p, communityId: v }))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear usuario"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
