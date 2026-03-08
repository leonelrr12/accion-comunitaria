"use client";

import { useAppStore } from "@/lib/store";
import { UserPlus, ShieldAlert, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const currentUser = useAppStore((state) => state.currentUser);
    const users = useAppStore((state) => state.users);
    const persons = useAppStore((state) => state.persons);

    // Filtrar solo líderes (los que tienen role LEADER u omiten ADMIN)
    const lideres = users.filter((u) => u.role !== "ADMIN");

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="md:flex md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate flex items-center gap-3">
                        Bienvenido, {currentUser?.name}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Administrador
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Estás en la consola de administración. Aquí puedes gestionar a los líderes geográficos de la red.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        href="/admin/dashboard/nuevo-lider"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
                    >
                        <UserPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Crear Nuevo Líder
                    </Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <ShieldAlert className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 truncate">Total Líderes Activos</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{lideres.length}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                        <BarChart3 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 truncate">Total Afiliados Globales</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{persons.length}</p>
                    </div>
                </div>
            </div>

            {/* List of Leaders */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 font-semibold text-gray-900">
                    Directorio de Líderes
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Líder
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Código de Invitación
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Afiliados a su Red
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lideres.length > 0 ? (
                                lideres.map((lider) => {
                                    const count = persons.filter((p) => p.leaderId === lider.id).length;
                                    return (
                                        <tr key={lider.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                                                            {lider.name.charAt(0)}{lider.lastName.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {lider.name} {lider.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{lider.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{lider.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 font-mono">
                                                    {lider.inviteCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">
                                                {count} personas
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                                        No hay líderes registrados en el sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
