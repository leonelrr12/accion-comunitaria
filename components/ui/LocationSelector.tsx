"use client";

import { useState, useEffect, useRef } from "react";
import {
    getProvinces,
    getDistricts,
    getCorregimientos,
    getCommunities
} from "../../app/actions/geography";
import { Loader2, ChevronDown } from "lucide-react";

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

    // Skip cascade effects on first mount (init useEffect already handles pre-loading)
    const isMounted = useRef(false);

    // Refs to track initial values (avoid re-running cascade on mount)
    const initialProvinceId = provinceId;
    const initialDistrictId = districtId;
    const initialCorregimientoId = corregimientoId;

    // On mount: load provinces and (if we have initial values) load all dependent lists in parallel
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const provincesData = await getProvinces();
            setProvinces(provincesData);

            // If we have an initial provinceId, pre-load districts
            if (initialProvinceId) {
                const districtsData = await getDistricts(parseInt(initialProvinceId));
                setDistricts(districtsData);

                // If we have an initial districtId, pre-load corregimientos
                if (initialDistrictId) {
                    const corData = await getCorregimientos(parseInt(initialDistrictId));
                    setCorregimientos(corData);

                    // If we have an initial corregimientoId, pre-load communities
                    if (initialCorregimientoId) {
                        const comData = await getCommunities(parseInt(initialCorregimientoId));
                        setCommunities(comData);
                    }
                }
            }
            setLoading(false);
        };
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // only on mount

    // Fetch Districts when Province changes
    useEffect(() => {
        if (provinceId) {
            getDistricts(parseInt(provinceId)).then(setDistricts);
        } else {
            setDistricts([]);
            setCorregimientos([]);
            setCommunities([]);
        }
    }, [provinceId]);

    // Fetch Corregimientos when District changes
    useEffect(() => {
        if (districtId) {
            getCorregimientos(parseInt(districtId)).then(setCorregimientos);
        } else {
            setCorregimientos([]);
            setCommunities([]);
        }
    }, [districtId]);

    // Fetch Communities when Corregimiento changes
    useEffect(() => {
        if (corregimientoId) {
            getCommunities(parseInt(corregimientoId)).then(setCommunities);
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
                            className="block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 pr-10 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200 appearance-none pointer-events-auto"
                        >
                            <option value="">Seleccione una provincia...</option>
                            {provinces.map((p) => (
                                <option key={p.id} value={p.id.toString()}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
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
                            className="block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 pr-10 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200 appearance-none"
                        >
                            <option value="">Seleccione un distrito...</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id.toString()}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDown className="h-4 w-4" />
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
                            className="block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 pr-10 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200 appearance-none"
                        >
                            <option value="">Seleccione corregimiento...</option>
                            {corregimientos.map((c) => (
                                <option key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDown className="h-4 w-4" />
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
                            className="block w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 pr-10 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 hover:border-blue-400 group-disabled:hover:border-gray-200 appearance-none"
                        >
                            <option value="">Seleccione comunidad...</option>
                            {communities.map((com) => (
                                <option key={com.id} value={com.id.toString()}>
                                    {com.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
