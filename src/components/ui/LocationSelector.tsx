"use client";

import { useMemo } from "react";
import { panamaGeography } from "@/data/geography";

interface LocationSelectorProps {
    provinceId: string;
    districtId: string;
    corregimientoId: string;
    communityId: string;
    setProvinceId: (val: string) => void;
    setDistrictId: (val: string) => void;
    setCorregimientoId: (val: string) => void;
    setCommunityId: (val: string) => void;
    disabled?: boolean;
}

export function LocationSelector({
    provinceId,
    districtId,
    corregimientoId,
    communityId,
    setProvinceId,
    setDistrictId,
    setCorregimientoId,
    setCommunityId,
    disabled = false,
}: LocationSelectorProps) {
    const provinces = panamaGeography;

    const districts = useMemo(() => {
        return provinces.find((p) => p.id === provinceId)?.districts || [];
    }, [provinceId, provinces]);

    const corregimientos = useMemo(() => {
        return districts.find((d) => d.id === districtId)?.corregimientos || [];
    }, [districtId, districts]);

    const communities = useMemo(() => {
        return (
            corregimientos.find((c) => c.id === corregimientoId)?.communities || []
        );
    }, [corregimientoId, corregimientos]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Provincia */}
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">1</span>
                        Provincia
                    </label>
                    <div className="relative group">
                        <select
                            value={provinceId}
                            disabled={disabled}
                            required
                            onChange={(e) => {
                                setProvinceId(e.target.value);
                                setDistrictId("");
                                setCorregimientoId("");
                                setCommunityId("");
                            }}
                            className="appearance-none block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200"
                        >
                            <option value="" disabled>Seleccione una provincia...</option>
                            {provinces.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-hover:text-blue-500 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Distrito */}
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <span className={`rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold transition-colors ${provinceId ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>2</span>
                        Distrito
                    </label>
                    <div className="relative group">
                        <select
                            value={districtId}
                            disabled={disabled || !provinceId}
                            required
                            onChange={(e) => {
                                setDistrictId(e.target.value);
                                setCorregimientoId("");
                                setCommunityId("");
                            }}
                            className="appearance-none block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200"
                        >
                            <option value="" disabled>Seleccione un distrito...</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-hover:text-blue-500 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Corregimiento */}
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <span className={`rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold transition-colors ${districtId ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>3</span>
                        Corregimiento
                    </label>
                    <div className="relative group">
                        <select
                            value={corregimientoId}
                            disabled={disabled || !districtId}
                            required
                            onChange={(e) => {
                                setCorregimientoId(e.target.value);
                                setCommunityId("");
                            }}
                            className="appearance-none block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200"
                        >
                            <option value="" disabled>Seleccione corregimiento...</option>
                            {corregimientos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-hover:text-blue-500 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Comunidad */}
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <span className={`rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold transition-colors ${corregimientoId ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>4</span>
                        Comunidad
                    </label>
                    <div className="relative group">
                        <select
                            value={communityId}
                            disabled={disabled || !corregimientoId}
                            required
                            onChange={(e) => setCommunityId(e.target.value)}
                            className="appearance-none block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200"
                        >
                            <option value="" disabled>Seleccione comunidad...</option>
                            {communities.map((com) => (
                                <option key={com.id} value={com.id}>
                                    {com.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-hover:text-blue-500 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
