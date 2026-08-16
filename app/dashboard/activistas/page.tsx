"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users2, Phone, Mail, MapPin, UserCheck, Loader2, Users, UserPlus } from "lucide-react";
import { getMyActivists } from "../../actions/users";

interface TeamMember {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: string;
    province: string | null;
    district: string | null;
    corregimiento: string | null;
    community: string | null;
    afiliados: number;
    teamSize: number;
}

export default function ActivistasPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyActivists().then((data) => {
            setTeam(data);
            setLoading(false);
        });
    }, []);

    const locationText = (m: TeamMember) =>
        [m.province, m.district, m.corregimiento, m.community].filter(Boolean).join(" › ");

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Users2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Gestión de Activistas</h1>
                        <p className="text-sm text-slate-500">Los usuarios bajo tu liderazgo y su progreso</p>
                    </div>
                </div>
                <Link
                    href="/dashboard/nuevo-usuario"
                    className="inline-flex items-center justify-center rounded-xl border border-transparent bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrar Líder
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-16 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : team.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-700 font-medium">Aún no tienes activistas o líderes bajo tu cargo</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Cuando registres líderes desde{" "}
                        <Link href="/dashboard/nuevo-usuario" className="text-blue-600 font-medium hover:underline">
                            Registrar Líder
                        </Link>
                        , aparecerán aquí.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map((m) => (
                        <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-indigo-200 transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {m.name} {m.lastName}
                                    </h3>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold">
                                        {m.role}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-sm text-slate-500">
                                {m.phone && (
                                    <p className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {m.phone}
                                    </p>
                                )}
                                <p className="flex items-center gap-2 truncate">
                                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {m.email}
                                </p>
                                {locationText(m) && (
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {locationText(m)}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <UserCheck className="h-4 w-4 text-blue-500" />
                                    <span className="font-bold text-slate-800">{m.afiliados}</span>
                                    <span className="text-slate-400 text-xs">afiliados</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users2 className="h-4 w-4 text-indigo-500" />
                                    <span className="font-bold text-slate-800">{m.teamSize}</span>
                                    <span className="text-slate-400 text-xs">a su cargo</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
