"use client";

import { useState, useEffect, useTransition } from "react";
import {
    MapPin,
    Plus,
    ChevronRight,
    Globe,
    Map,
    Navigation,
    Locate,
    Trash2,
    Loader2
} from "lucide-react";
import {
    getProvinces, createProvince, deleteProvince,
    getDistricts, createDistrict,
    getCorregimientos, createCorregimiento,
    getCommunities, createCommunity
} from "@/app/actions/geography";

export default function GeografiaCRUD() {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [corregimientos, setCorregimientos] = useState<any[]>([]);
    const [communities, setCommunities] = useState<any[]>([]);

    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedCorregimientoId, setSelectedCorregimientoId] = useState<number | null>(null);

    // Individual input states to prevent mirroring
    const [provinceInput, setProvinceInput] = useState("");
    const [districtInput, setDistrictInput] = useState("");
    const [corregimientoInput, setCorregimientoInput] = useState("");
    const [communityInput, setCommunityInput] = useState("");

    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        loadProvinces();
    }, []);

    const loadProvinces = async () => {
        setLoading(true);
        const data = await getProvinces();
        setProvinces(data);
        setLoading(false);
    };

    const handleSelectProvince = async (id: number) => {
        // Toggle selection if already selected
        if (selectedProvinceId === id) {
            setSelectedProvinceId(null);
            setSelectedDistrictId(null);
            setSelectedCorregimientoId(null);
            setDistricts([]);
            setCorregimientos([]);
            setCommunities([]);
            return;
        }

        setSelectedProvinceId(id);
        setSelectedDistrictId(null);
        setSelectedCorregimientoId(null);
        setDistricts([]);
        setCorregimientos([]);
        setCommunities([]);
        const data = await getDistricts(id);
        setDistricts(data);
    };

    const handleSelectDistrict = async (id: number) => {
        if (selectedDistrictId === id) {
            setSelectedDistrictId(null);
            setSelectedCorregimientoId(null);
            setCorregimientos([]);
            setCommunities([]);
            return;
        }

        setSelectedDistrictId(id);
        setSelectedCorregimientoId(null);
        setCorregimientos([]);
        setCommunities([]);
        const data = await getCorregimientos(id);
        setCorregimientos(data);
    };

    const handleSelectCorregimiento = async (id: number) => {
        if (selectedCorregimientoId === id) {
            setSelectedCorregimientoId(null);
            setCommunities([]);
            return;
        }

        setSelectedCorregimientoId(id);
        setCommunities([]);
        const data = await getCommunities(id);
        setCommunities(data);
    };

    const handleAddItem = async (type: 'province' | 'district' | 'corregimiento' | 'community') => {
        let name = "";
        if (type === 'province') name = provinceInput;
        else if (type === 'district') name = districtInput;
        else if (type === 'corregimiento') name = corregimientoInput;
        else if (type === 'community') name = communityInput;

        if (!name.trim()) return;

        startTransition(async () => {
            try {
                if (type === 'province') {
                    await createProvince(name);
                    setProvinceInput("");
                    await loadProvinces();
                } else if (type === 'district' && selectedProvinceId) {
                    await createDistrict(selectedProvinceId, name);
                    setDistrictInput("");
                    const data = await getDistricts(selectedProvinceId);
                    setDistricts(data);
                } else if (type === 'corregimiento' && selectedDistrictId) {
                    await createCorregimiento(selectedDistrictId, name);
                    setCorregimientoInput("");
                    const data = await getCorregimientos(selectedDistrictId);
                    setCorregimientos(data);
                } else if (type === 'community' && selectedCorregimientoId) {
                    await createCommunity(selectedCorregimientoId, name);
                    setCommunityInput("");
                    const data = await getCommunities(selectedCorregimientoId);
                    setCommunities(data);
                }
            } catch (err) {
                alert("Error al crear el elemento");
            }
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                <p className="text-slate-500 font-medium">Cargando base geográfica...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
                        <MapPin className="h-8 w-8 text-emerald-600" />
                        Estructura Geográfica
                    </h1>
                    <p className="text-slate-500 font-medium">Gestiona la jerarquía territorial de forma vertical para mayor precisión.</p>
                </div>
            </header>

            <div className="flex flex-col gap-6">

                {/* 1. PROVINCIAS */}
                <div className="space-y-4">
                    <GeoColumn
                        title="1. Provincias"
                        icon={<Globe className="h-5 w-5" />}
                        items={provinces}
                        selectedId={selectedProvinceId}
                        onSelect={handleSelectProvince}
                        onAdd={() => handleAddItem('province')}
                        inputValue={provinceInput}
                        setInputValue={setProvinceInput}
                        isPending={isPending}
                        type="province"
                        active={true}
                    />
                </div>

                {/* 2. DISTRITOS */}
                <div className="space-y-4">
                    <GeoColumn
                        title="2. Distritos"
                        icon={<Map className="h-5 w-5" />}
                        items={districts}
                        selectedId={selectedDistrictId}
                        onSelect={handleSelectDistrict}
                        onAdd={() => handleAddItem('district')}
                        inputValue={districtInput}
                        setInputValue={setDistrictInput}
                        isPending={isPending}
                        type="district"
                        active={selectedProvinceId !== null}
                        placeholder="← Selecciona una provincia arriba para gestionar distritos"
                    />
                </div>

                {/* 3. CORREGIMIENTOS */}
                <div className="space-y-4">
                    <GeoColumn
                        title="3. Corregimientos"
                        icon={<Navigation className="h-5 w-5" />}
                        items={corregimientos}
                        selectedId={selectedCorregimientoId}
                        onSelect={handleSelectCorregimiento}
                        onAdd={() => handleAddItem('corregimiento')}
                        inputValue={corregimientoInput}
                        setInputValue={setCorregimientoInput}
                        isPending={isPending}
                        type="corregimiento"
                        active={selectedDistrictId !== null}
                        placeholder="← Selecciona un distrito arriba para gestionar corregimientos"
                    />
                </div>

                {/* 4. COMUNIDADES */}
                <div className="space-y-4">
                    <GeoColumn
                        title="4. Comunidades o Zonas"
                        icon={<Locate className="h-5 w-5" />}
                        items={communities}
                        selectedId={null}
                        onSelect={() => { }}
                        onAdd={() => handleAddItem('community')}
                        inputValue={communityInput}
                        setInputValue={setCommunityInput}
                        isPending={isPending}
                        type="community"
                        active={selectedCorregimientoId !== null}
                        placeholder="← Selecciona corregimiento arriba para gestionar comunidades"
                    />
                </div>
            </div>
        </div>
    );
}

function GeoColumn({
    title, icon, items, selectedId, onSelect, onAdd,
    inputValue, setInputValue, isPending, type, active, placeholder
}: any) {
    if (!active) {
        return (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                <p className="text-slate-400 text-sm font-bold italic">{placeholder}</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-3xl flex flex-col shadow-lg shadow-slate-100 overflow-hidden transition-all hover:border-emerald-200">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                    <span className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">{icon}</span>
                    {title}
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    {items.length} Registros
                </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                {items.map((item: any) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center justify-between group border-2 ${selectedId === item.id
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-lg shadow-emerald-100'
                            : 'text-slate-600 bg-white border-slate-100 hover:border-emerald-400 hover:bg-emerald-50'
                            }`}
                    >
                        <span className="truncate">{item.name}</span>
                        {selectedId === item.id && <ChevronRight className="h-4 w-4" />}
                    </button>
                ))}

                {items.length === 0 && (
                    <div className="py-12 text-center col-span-full">
                        <p className="text-sm text-slate-400 font-medium italic">No hay registros creados en esta sección.</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <div className="flex gap-2 max-w-md">
                    <input
                        type="text"
                        placeholder={`Añadir nuevo a ${title.split('.')[1]?.trim()}...`}
                        className="flex-1 text-sm px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
                        disabled={isPending}
                    />
                    <button
                        onClick={onAdd}
                        disabled={isPending || !inputValue.trim()}
                        className="px-6 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline">Agregar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
