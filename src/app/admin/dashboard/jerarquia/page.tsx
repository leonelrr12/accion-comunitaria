"use client";

import { useState, useEffect } from "react";
import { getHierarchy } from "@/app/actions/users";
import { Users, ChevronRight, UserCircle, MapPin, Loader2, Network } from "lucide-react";

export default function HierarchyPage() {
    const [hierarchy, setHierarchy] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHierarchy = async () => {
            setLoading(true);
            const data = await getHierarchy();
            setHierarchy(data);
            setLoading(false);
        };
        fetchHierarchy();
    }, []);

    // Filter root leaders (those who are not subordinates of someone else in this list)
    // Actually, based on our data structure, if a user's ID is not in any subordinates list
    const subordinateIds = new Set(hierarchy.flatMap(u => u.subordinates.map((s: any) => s.subordinateId)));
    const rootLeaders = hierarchy.filter(u => !subordinateIds.has(u.id));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-bold italic">Generando mapa de jerarquía...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <Network className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Estructura de Liderazgo</h1>
                </div>
                <p className="text-slate-500 font-medium ml-14">Visualización del organigrama político y cadena de mando.</p>
            </div>

            <div className="space-y-6">
                {rootLeaders.length > 0 ? (
                    rootLeaders.map((leader) => (
                        <HierarchyNode key={leader.id} leader={leader} allUsers={hierarchy} depth={0} />
                    ))
                ) : (
                    <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold italic">No hay una jerarquía definida aún.</p>
                        <p className="text-xs text-slate-400 mt-2">Usa la sección de Gestión de Usuarios para vincular líderes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function HierarchyNode({ leader, allUsers, depth }: { leader: any, allUsers: any[], depth: number }) {
    const subordinates = leader.subordinates.map((s: any) => {
        return allUsers.find(u => u.id === s.subordinateId);
    }).filter(Boolean);

    const roleColors: Record<string, string> = {
        "ADMIN": "bg-slate-900 text-white",
        "Lider Regional": "bg-blue-600 text-white",
        "Lider de Zona": "bg-indigo-500 text-white",
        "Comunitario": "bg-emerald-500 text-white",
        "Activista": "bg-amber-500 text-white"
    };

    return (
        <div className="space-y-4">
            <div className={`flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md ml-${depth * 8}`}>
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserCircle className="h-8 w-8" />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-slate-900">{leader.name} {leader.lastName}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${roleColors[leader.role.name] || 'bg-slate-100 text-slate-600'}`}>
                            {leader.role.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                            {leader.email}
                        </span>
                        {leader.provinceId && (
                            <span className="flex items-center gap-1 text-blue-600">
                                <MapPin className="h-3 w-3" />
                                Territorio Asignado
                            </span>
                        )}
                    </div>
                </div>
                {subordinates.length > 0 && (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs ring-4 ring-white">
                        {subordinates.length}
                    </div>
                )}
            </div>

            {subordinates.length > 0 && (
                <div className="relative pt-2 pl-4 ml-6 border-l-2 border-slate-100 space-y-4">
                    {subordinates.map((sub: any) => (
                        <div key={sub.id} className="relative">
                            <div className="absolute top-6 -left-4 w-4 h-0.5 bg-slate-100"></div>
                            <HierarchyNode leader={sub} allUsers={allUsers} depth={0} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
