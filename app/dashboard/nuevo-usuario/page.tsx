"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { LocationSelector } from "../../../components/ui/LocationSelector";
import { getRoles } from "../../actions/roles";
import { createUserAction, getAllUsers } from "../../actions/users";
import { Loader2, UserPlus, ShieldAlert, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NuevoUsuario() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const currentUser = useAppStore((state) => state.currentUser);

    const [roles, setRoles] = useState<any[]>([]);
    const [creatableRoles, setCreatableRoles] = useState<any[]>([]);
    const [availableLeaders, setAvailableLeaders] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        provinceId: "",
        districtId: "",
        corregimientoId: "",
        communityId: "",
        role: "",
        parentLeaderId: "",
    });

    // Prellenar ubicación desde el creador UNA sola vez (no pisa la selección del usuario)
    const prefilledRef = useRef(false);
    useEffect(() => {
        if (currentUser && !prefilledRef.current) {
            prefilledRef.current = true;
            setFormData((prev) => ({
                ...prev,
                provinceId: currentUser.provinceId?.toString() || process.env.NEXT_PUBLIC_DEFAULT_PROVINCE_ID || "",
                districtId: currentUser.districtId?.toString() || process.env.NEXT_PUBLIC_DEFAULT_DISTRICT_ID || "",
                corregimientoId: currentUser.corregimientoId?.toString() || "",
                communityId: currentUser.communityId?.toString() || "",
            }));
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (currentUser?.role === "ADMIN") {
            getAllUsers().then((users: any[]) => {
                setAvailableLeaders(
                    users.filter((u: any) => u.role.name !== "ADMIN" && u.role.name !== "Activista")
                );
            });
        }
    }, [currentUser?.role]);

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
                // Default al primer rol que exige líder superior (Lider Global queda para elegirlo explícitamente)
                const defaultRole = allowed.find((r: any) => r.name !== "Lider Global")?.name || allowed[0]?.name || "";
                setFormData((prev) => ({ ...prev, role: defaultRole }));
            }
        });
    }, [currentUser?.role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role) {
            toast.warning("Tu rol no permite crear usuarios.");
            return;
        }

        // Ubicación según rol: comunidad en blanco = multi-zona; Lider Global es nacional
        const isGlobal = formData.role === "Lider Global";
        if (!isGlobal && (!formData.provinceId || !formData.districtId)) {
            toast.warning("Este rol requiere provincia y distrito (corregimiento y comunidad en blanco = multi-zona).");
            return;
        }
        if (formData.role === "Activista" && (!formData.corregimientoId || !formData.communityId)) {
            toast.warning("El Activista debe tener definidos corregimiento y comunidad.");
            return;
        }
        // El Líder Superior es obligatorio cuando lo elige el ADMIN (los demás roles asignan bajo sí mismos)
        if (currentUser?.role === "ADMIN" && !isGlobal && !formData.parentLeaderId) {
            toast.warning("El Líder Superior es obligatorio.");
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

                        {currentUser?.role === "ADMIN" && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Líder Superior (solo ADMIN)</label>
                                <select
                                    value={formData.parentLeaderId}
                                    onChange={(e) => setFormData({ ...formData, parentLeaderId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                >
                                    <option value="">Sin líder (top de jerarquía)</option>
                                    {availableLeaders.map((l: any) => (
                                        <option key={l.id} value={l.id}>{l.name} {l.lastName} ({l.role.name})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mt-1">
                                    Los demás roles asignan a sus creados bajo su propio liderazgo automáticamente.
                                </p>
                            </div>
                        )}

                        {formData.role === "Lider Global" ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                                🌎 <strong>Líder Global es nacional</strong> — no requiere ubicación geográfica.
                            </div>
                        ) : (
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
                        )}

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
