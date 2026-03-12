"use client";

import { useAppStore } from "@/lib/store";
import { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAffiliates, getAllAffiliates } from "@/app/actions/affiliates";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import { useDebounce } from "@/lib/useDebounce";
import { exportToCSV } from "@/lib/export";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function Afiliados() {
    const currentUser = useAppStore((state) => state.currentUser);

    const [persons, setPersons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isExporting, setIsExporting] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 350);

    const handleExport = async () => {
        if (!currentUser) return;
        setIsExporting(true);
        try {
            const data = await getAllAffiliates(currentUser.id);
            const headers = [
                { label: "Nombre", key: "name" },
                { label: "Apellido", key: "lastName" },
                { label: "Cédula", key: "cedula" },
                { label: "Email", key: "email" },
                { label: "Teléfono", key: "phone" },
                { label: "Provincia", key: "province.name" },
                { label: "Distrito", key: "district.name" },
                { label: "Corregimiento", key: "corregimiento.name" },
                { label: "Comunidad", key: "community.name" },
                { label: "Fecha Registro", key: "createdAt" },
            ];
            exportToCSV(data, "afiliados", headers);
            toast.success("Exportación completada");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Error al exportar datos");
        } finally {
            setIsExporting(false);
        }
    };

    const loadAffiliates = useCallback(async (page: number, search: string) => {
        if (!currentUser) return;
        setLoading(true);
        const result = await getAffiliates({
            leaderUserId: currentUser.id,
            page,
            pageSize: PAGE_SIZE,
            search,
        });
        setPersons(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        loadAffiliates(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch, loadAffiliates]);

    if (!currentUser) return null;

    const getLocationName = (person: any) => {
        const distName = person.district?.name || "—";
        const provName = person.province?.name || "—";
        return `${distName}, ${provName}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Directorio de Afiliados</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {total > 0 ? `${total} afiliados registrados en tu red.` : "Aún no has registrado ningún afiliado."}
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting || total === 0}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <div className="mr-2 h-4 w-4 border-2 border-slate-400 rounded-sm" />}
                        Exportar CSV
                    </button>
                    <Link
                        href="/dashboard/nuevo-afiliado"
                        className="inline-flex items-center justify-center rounded-xl border border-transparent bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Añadir Afiliado
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white px-4 py-4 border border-gray-100 rounded-2xl shadow-sm">
                <SearchBar
                    value={searchTerm}
                    onChange={(v) => setSearchTerm(v)}
                    placeholder="Buscar por nombre, apellido o cédula..."
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-3">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-slate-400 font-medium">Buscando afiliados...</p>
                    </div>
                ) : (
                    <>
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
                                    {persons.map((person) => (
                                        <tr key={person.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {person.name.charAt(0)}{person.lastName.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-slate-900 text-sm">
                                                        {person.name} {person.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                                                {person.cedula}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {person.phone || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {getLocationName(person)}
                                            </td>
                                        </tr>
                                    ))}
                                    {persons.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                {debouncedSearch
                                                    ? `No se encontraron resultados para "${debouncedSearch}".`
                                                    : "Aún no has registrado ningún afiliado."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={total}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
