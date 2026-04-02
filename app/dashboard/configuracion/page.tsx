"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Lock, Eye, EyeOff, Save, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracionPage() {
    const currentUser = useAppStore((state) => state.currentUser);
    const setCurrentUser = useAppStore((state) => state.setCurrentUser);
    const router = useRouter();

    // Datos personales
    const [name, setName] = useState(currentUser?.name ?? "");
    const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
    const [phone, setPhone] = useState(currentUser?.phone ?? "");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    // Cambio de contraseña
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    if (!currentUser) return null;

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch(`/api/users/${currentUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, lastName, phone }),
            });
            if (res.ok) {
                setCurrentUser({ ...currentUser, name, lastName, phone });
                setProfileSaved(true);
                toast.success("Perfil actualizado correctamente");
                setTimeout(() => setProfileSaved(false), 3000);
            } else {
                toast.error("Error al actualizar el perfil");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }
        setSavingPassword(true);
        try {
            const res = await fetch(`/api/users/${currentUser.id}/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (res.ok) {
                toast.success("Contraseña actualizada. Por favor vuelve a iniciar sesión.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message || "Error al cambiar la contraseña");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mi Configuración</h1>
                <p className="text-sm text-slate-500 mt-1">Administra tu perfil y seguridad de la cuenta.</p>
            </div>

            {/* Avatar + info rápida */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                    {currentUser.name.charAt(0)}{currentUser.lastName.charAt(0)}
                </div>
                <div>
                    <p className="text-lg font-bold text-slate-900">{currentUser.name} {currentUser.lastName}</p>
                    <p className="text-sm text-slate-500">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                        <Shield className="h-3 w-3" />
                        {currentUser.role}
                    </span>
                </div>
            </div>

            {/* Datos personales */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Datos Personales
                    </h2>
                </div>
                <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Apellido
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Correo Electrónico</span>
                        </label>
                        <input
                            type="email"
                            value={currentUser.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-400 bg-slate-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">El correo no puede ser modificado.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</span>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ej: 6000-0000"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200"
                        >
                            {profileSaved
                                ? <><CheckCircle2 className="h-4 w-4" /> Guardado</>
                                : savingProfile
                                    ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Guardando...</>
                                    : <><Save className="h-4 w-4" /> Guardar Cambios</>
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* Seguridad */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        Cambiar Contraseña
                    </h2>
                </div>
                <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                    {/* Contraseña actual */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Contraseña Actual
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition"
                            />
                            <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Nueva contraseña */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Mínimo 8 caracteres"
                                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition"
                            />
                            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {/* Strength indicator */}
                        {newPassword.length > 0 && (
                            <div className="flex gap-1 mt-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                                        newPassword.length >= (i + 1) * 3
                                            ? i < 2 ? "bg-red-400" : i === 2 ? "bg-yellow-400" : "bg-emerald-500"
                                            : "bg-slate-200"
                                    }`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Confirmar */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Repite la nueva contraseña"
                                className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 bg-slate-50 transition ${
                                    confirmPassword && confirmPassword !== newPassword
                                        ? "border-red-300 focus:ring-red-400"
                                        : "border-gray-200 focus:ring-blue-500"
                                }`}
                            />
                            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all"
                        >
                            {savingPassword
                                ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Actualizando...</>
                                : <><Lock className="h-4 w-4" /> Actualizar Contraseña</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
