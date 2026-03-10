"use client";

import { useAppStore } from "@/lib/store";
import { useState, useEffect, useTransition } from "react";
import { Search, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAffiliates } from "@/app/actions/affiliates";

export default function Afiliados() {
    const currentUser = useAppStore((state) => state.currentUser);
    const [persons, setPersons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (currentUser) {
            loadAffiliates();
        }
    }, [currentUser]);

    const loadAffiliates = async () => {
        setLoading(true);
        // Only get affiliates for the current leader
        const data = await getAffiliates(currentUser?.id);
        setPersons(data);
        setLoading(false);
    };

    if (!currentUser) return null;

    // Search logic
    const filteredAffiliates = persons.filter((p) =>
        `${p.name} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone && p.phone.includes(searchTerm)) ||
        p.cedula.includes(searchTerm)
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredAffiliates.length / itemsPerPage);
    const paginatedAffiliates = filteredAffiliates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Helper to get location name using the included relations
    const getLocationName = (person: any) => {
        const distName = person.district?.name || 'Desconocido';
        const provName = person.province?.name || 'Desconocido';
        return `${distName}, ${provName}`;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Sincronizando directorio de afiliados...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Directorio de Afiliados
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Visualizando datos reales de PostgreSQL para tu red de contactos.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link
                        href="/dashboard/nuevo-afiliado"
                        className="inline-flex items-center justify-center rounded-xl border border-transparent bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all sm:w-auto"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Añadir Afiliado
                    </Link>
                </div>
            </div>

            <div className="bg-white px-4 py-5 border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
                    <div className="flex-grow">
                        <div className="relative rounded-xl shadow-sm max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-2.5 px-3 border outline-none transition-all"
                                placeholder="Buscar por nombre, cédula o teléfono"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cédula / ID</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {paginatedAffiliates.map((person) => (
                                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center font-semibold text-slate-900">
                                            {person.name} {person.lastName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                                        {person.cedula}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {person.phone || "---"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {getLocationName(person)}
                                    </td>
                                </tr>
                            ))}
                            {paginatedAffiliates.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'Aún no has registrado ningún afiliado.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"
                    >
                        &larr;
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded-lg border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"
                    >
                        &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
