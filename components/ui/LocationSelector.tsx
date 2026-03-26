"use client";

import { useState, useEffect } from "react";
import {
    getProvinces,
    getDistricts,
    getCorregimientos,
    getCommunities
} from "../../app/actions/geography";
import { Loader2 } from "lucide-react";

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
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [corregimientos, setCorregimientos] = useState<any[]>([]);
    const [communities, setCommunities] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    // Fetch Provinces on mount
    useEffect(() => {
        const fetchInitial = async () => {
            const data = await getProvinces();
            setProvinces(data);
        };
        fetchInitial();
    }, []);

    // Fetch Districts when Province changes
    useEffect(() => {
        if (provinceId) {
            const fetchDistricts = async () => {
                const data = await getDistricts(parseInt(provinceId));
                setDistricts(data);
            };
            fetchDistricts();
        } else {
            setDistricts([]);
        }
    }, [provinceId]);

    // Fetch Corregimientos when District changes
    useEffect(() => {
        if (districtId) {
            const fetchCor = async () => {
                const data = await getCorregimientos(parseInt(districtId));
                setCorregimientos(data);
            };
            fetchCor();
        } else {
            setCorregimientos([]);
        }
    }, [districtId]);

    // Fetch Communities when Corregimiento changes
    useEffect(() => {
        if (corregimientoId) {
            const fetchCom = async () => {
                const data = await getCommunities(parseInt(corregimientoId));
                setCommunities(data);
            };
            fetchCom();
        } else {
            setCommunities([]);
        }
    }, [corregimientoId]);

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
                            <option value="">Seleccione una provincia...</option>
                            {provinces.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
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
                            <option value="">Seleccione un distrito...</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
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
                            <option value="">Seleccione corregimiento...</option>
                            {corregimientos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
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
                            <option value="">Seleccione comunidad...</option>
                            {communities.map((com) => (
                                <option key={com.id} value={com.id}>
                                    {com.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
