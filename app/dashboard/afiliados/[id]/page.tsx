"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getAffiliateById } from "../../../actions/affiliates";
import { ArrowLeft, Loader2, User, Phone, Mail, MapPin, Hash, Calendar, Building2 } from "lucide-react";

export default function AffiliateProfile({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [person, setPerson] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerson = async () => {
            setLoading(true);
            try {
                const data = await getAffiliateById(parseInt(resolvedParams.id, 10));
                setPerson(data);
            } catch (err) {
                console.error("Error al cargar perfil:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPerson();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-medium">Cargando perfil...</p>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <p className="text-slate-500 font-medium text-lg">Afiliado no encontrado.</p>
                <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">Volver</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a la lista
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-10 text-white relative flex flex-col items-center text-center">
                    <div className="absolute top-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
                    <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-black mb-4 z-10 shadow-xl border-4 border-white">
                        {person.name.charAt(0)}{person.lastName.charAt(0)}
                    </div>
                    <h1 className="text-3xl font-black z-10">{person.name} {person.lastName}</h1>
                    <p className="text-blue-200 mt-2 font-medium flex items-center gap-2 z-10">
                        <User className="h-4 w-4" /> Afiliado Registrado
                    </p>
                </div>

                <div className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-gray-100 pb-2">Datos Personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500">Cédula / ID</p>
                                <p className="text-base font-medium text-slate-900">{person.cedula}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500">Teléfono</p>
                                <p className="text-base font-medium text-slate-900">{person.phone || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500">Correo Electrónico</p>
                                <p className="text-base font-medium text-slate-900">{person.email || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500">Fecha de Registro</p>
                                <p className="text-base font-medium text-slate-900">{new Date(person.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-10 mb-6 border-b border-gray-100 pb-2">Ubicación Geográfica</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Provincia</p>
                            <p className="font-semibold text-slate-900">{person.province?.name || '—'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Distrito</p>
                            <p className="font-semibold text-slate-900">{person.district?.name || '—'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Corregimiento</p>
                            <p className="font-semibold text-slate-900">{person.corregimiento?.name || '—'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Comunidad</p>
                            <p className="font-semibold text-slate-900">{person.community?.name || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
