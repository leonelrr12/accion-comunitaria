"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { UserPlus, Shield, User as UserIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GestionUsuarios() {
    const users = useAppStore((state) => state.users);
    const roles = useAppStore((state) => state.roles);
    const currentUser = useAppStore((state) => state.currentUser);
    const createUser = useAppStore((state) => state.createUser);

    // Admin Creation State
    const [adminData, setAdminData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "ADMIN" // Default starting role
    });

    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        createUser({ ...adminData }, currentUser?.id);
        setAdminData({ name: "", lastName: "", email: "", password: "", phone: "", role: "ADMIN" });
        alert("Usuario creado exitosamente");
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <UserPlus className="h-8 w-8 text-blue-600" />
                    Gestión de Usuarios y Accesos
                </h1>
            </div>

            {/* SECCIÓN 1: CREACIÓN DE USUARIOS CON ROL DINÁMICO */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Registrar Nuevo Usuario</h2>
                        <p className="text-sm text-slate-500">Selecciona el rol adecuado para definir los permisos del usuario.</p>
                    </div>
                </div>

                <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Nombre</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50"
                            value={adminData.name}
                            onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Apellido</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50"
                            value={adminData.lastName}
                            onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50"
                            value={adminData.email}
                            onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50"
                            value={adminData.password}
                            onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Rol del Usuario</label>
                        <select
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                            value={adminData.role}
                            onChange={(e) => setAdminData({ ...adminData, role: e.target.value })}
                        >
                            {roles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                        <input
                            type="tel"
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50"
                            value={adminData.phone}
                            onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end lg:col-span-3">
                        <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
                            Registrar y Asignar Rol
                        </button>
                    </div>
                </form>
            </div>

            {/* SECCIÓN 2: LÍDERES (ACCESO RÁPIDO CON UBICACIÓN) */}
            <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-2xl">
                        <UserPlus className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Registro de Líderes por Ubicación</h2>
                        <p className="text-slate-400 text-sm">Usa este acceso si el usuario requiere geolocalización fija.</p>
                    </div>
                </div>
                <Link
                    href="/admin/dashboard/nuevo-lider"
                    className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                    Registrar con Geofence
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>

            {/* TABLA DE USUARIOS EXISTENTES */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Directorio de Personal</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil / Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Registrado por</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users.map((user) => {
                                const creator = users.find(u => u.id === user.createdBy);
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center font-semibold text-slate-900">
                                                {user.name} {user.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-slate-500">
                                            {creator ? `${creator.name} ${creator.lastName}` : "SISTEMA"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
