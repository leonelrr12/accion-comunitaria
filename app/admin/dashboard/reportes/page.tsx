"use client";

import { useEffect, useState } from "react";
import { BarChart3, MapPin, Users, Download, Loader2, ChevronDown } from "lucide-react";
import {
    getProvinceBreakdown,
    getDistrictBreakdown,
    getCorregimientoBreakdown,
    getCommunityBreakdown,
    getCorregimientoAffiliates,
    getCommunityAffiliates,
    getAffiliatesByLeader,
    getLeadersForReport,
} from "../../../actions/reports";
import { getProvinces, getDistricts, getCorregimientos, getCommunities } from "../../../actions/geography";
import { exportToXLSX } from "@/lib/export";

type Tab = "ubicacion" | "lider";

interface BreakdownRow { id: number; name: string; _count?: { persons: number } }
interface Affiliate {
    id: number;
    name: string;
    lastName: string;
    cedula: string;
    phone?: string | null;
    email?: string | null;
    leader?: { name: string; lastName: string; role?: { name: string } } | null;
    province?: { name: string } | null;
    district?: { name: string } | null;
    corregimiento?: { name: string } | null;
    community?: { name: string } | null;
}
interface LeaderRow { id: number; name: string; lastName: string; role: { name: string }; _count?: { persons: number } }

export default function ReportesPage() {
    const [tab, setTab] = useState<Tab>("ubicacion");

    // ── Pestaña ubicación ──
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [corregimientos, setCorregimientos] = useState<any[]>([]);
    const [communities, setCommunities] = useState<any[]>([]);
    const [sel, setSel] = useState({ province: "", district: "", corregimiento: "", community: "" });

    const [rows, setRows] = useState<BreakdownRow[]>([]);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [level, setLevel] = useState<"provincia" | "distrito" | "corregimiento" | "comunidad" | "afiliados">("provincia");
    const [scope, setScope] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Pestaña líder ──
    const [leaders, setLeaders] = useState<LeaderRow[]>([]);
    const [selectedLeader, setSelectedLeader] = useState("");
    const [leaderReport, setLeaderReport] = useState<any>(null);

    const loadProvinces = async () => {
        setLoading(true);
        const [provs, breakdown] = await Promise.all([getProvinces(), getProvinceBreakdown()]);
        setProvinces(provs);
        setRows(breakdown);
        setAffiliates([]);
        setLevel("provincia");
        setScope("");
        setLoading(false);
    };

    useEffect(() => { loadProvinces(); }, []);
    useEffect(() => { getLeadersForReport().then(setLeaders); }, []);

    const onProvince = async (v: string) => {
        setSel({ province: v, district: "", corregimiento: "", community: "" });
        setDistricts([]); setCorregimientos([]); setCommunities([]);
        if (!v) { await loadProvinces(); return; }
        setLoading(true);
        const [ds, br] = await Promise.all([getDistricts(parseInt(v)), getDistrictBreakdown(parseInt(v))]);
        setDistricts(ds); setRows(br); setAffiliates([]); setLevel("distrito");
        setLoading(false);
    };

    const onDistrict = async (v: string) => {
        setSel((p) => ({ ...p, district: v, corregimiento: "", community: "" }));
        setCorregimientos([]); setCommunities([]);
        if (!v) { const br = await getDistrictBreakdown(parseInt(sel.province)); setRows(br); setLevel("distrito"); return; }
        setLoading(true);
        const [cs, br] = await Promise.all([getCorregimientos(parseInt(v)), getCorregimientoBreakdown(parseInt(v))]);
        setCorregimientos(cs); setRows(br); setAffiliates([]); setLevel("corregimiento");
        setLoading(false);
    };

    const onCorregimiento = async (v: string) => {
        setSel((p) => ({ ...p, corregimiento: v, community: "" }));
        setCommunities([]);
        if (!v) { const br = await getCorregimientoBreakdown(parseInt(sel.district)); setRows(br); setLevel("corregimiento"); return; }
        setLoading(true);
        const [cs, affs] = await Promise.all([getCommunities(parseInt(v)), getCorregimientoAffiliates(parseInt(v))]);
        setCorregimientos((prev) => [...prev]); setCommunities(cs); setRows([]); setAffiliates(affs); setLevel("afiliados");
        const corrName = cs.find((c: any) => c.id === parseInt(v))?.name ?? "";
        setScope(corrName ? `Corregimiento ${corrName} — todas las comunidades` : "");
        setLoading(false);
    };

    const onCommunity = async (v: string) => {
        setSel((p) => ({ ...p, community: v }));
        if (!v) { const br = await getCommunityBreakdown(parseInt(sel.corregimiento)); setRows(br); setLevel("comunidad"); return; }
        setLoading(true);
        const affs = await getCommunityAffiliates(parseInt(v));
        setAffiliates(affs); setRows([]); setLevel("afiliados");
        const commName = communities.find((c: any) => c.id === parseInt(v))?.name ?? "";
        setScope(commName ? `Comunidad ${commName}` : "");
        setLoading(false);
    };

    const onLeaderSelect = async (v: string) => {
        setSelectedLeader(v);
        if (!v) { setLeaderReport(null); return; }
        const rep = await getAffiliatesByLeader(parseInt(v));
        setLeaderReport(rep);
    };

    const exportAffiliates = (data: Affiliate[], filename: string) => {
        exportToXLSX(data, filename, [
            { label: "Nombre", key: "name" },
            { label: "Apellido", key: "lastName" },
            { label: "Cédula", key: "cedula" },
            { label: "Teléfono", key: "phone" },
            { label: "Email", key: "email" },
            { label: "Provincia", key: "province.name" },
            { label: "Distrito", key: "district.name" },
            { label: "Corregimiento", key: "corregimiento.name" },
            { label: "Comunidad", key: "community.name" },
            { label: "Líder", key: "leaderName" },
        ]);
    };

    const withLeaderName = (data: Affiliate[]) =>
        data.map((a) => ({ ...a, leaderName: a.leader ? `${a.leader.name} ${a.leader.lastName}` : "" }));

    const leaderName = (l: LeaderRow) => `${l.name} ${l.lastName}`;
    const selectedLeaderName = leaders.find((l) => l.id.toString() === selectedLeader);

    const selectCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Reportes</h1>
                        <p className="text-sm text-slate-500">Información por ubicación y por líder</p>
                    </div>
                </div>
                <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setTab("ubicacion")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === "ubicacion" ? "bg-white shadow text-blue-700" : "text-slate-500"}`}
                    >
                        Por ubicación
                    </button>
                    <button
                        onClick={() => setTab("lider")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === "lider" ? "bg-white shadow text-blue-700" : "text-slate-500"}`}
                    >
                        Por líder
                    </button>
                </div>
            </div>

            {tab === "ubicacion" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Provincia</label>
                            <select className={selectCls} value={sel.province} onChange={(e) => onProvince(e.target.value)}>
                                <option value="">Todas</option>
                                {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Distrito</label>
                            <select className={selectCls} value={sel.district} onChange={(e) => onDistrict(e.target.value)} disabled={!sel.province}>
                                <option value="">Todos</option>
                                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Corregimiento</label>
                            <select className={selectCls} value={sel.corregimiento} onChange={(e) => onCorregimiento(e.target.value)} disabled={!sel.district}>
                                <option value="">Todos</option>
                                {corregimientos.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Comunidad</label>
                            <select className={selectCls} value={sel.community} onChange={(e) => onCommunity(e.target.value)} disabled={!sel.corregimiento}>
                                <option value="">Todas</option>
                                {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12 text-slate-400"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : level === "afiliados" ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    Afiliados {scope ? `— ${scope}` : ""} ({affiliates.length})
                                </h3>
                                {affiliates.length > 0 && (
                                    <button
                                        onClick={() => exportAffiliates(withLeaderName(affiliates), scope ? `afiliados_${scope.replace(/[^a-zA-Z0-9]/g, "_")}` : "afiliados")}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        <Download className="h-4 w-4" /> Exportar Excel
                                    </button>
                                )}
                            </div>
                            <AffiliatesTable affiliates={affiliates} />
                        </>
                    ) : (
                        <>
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-500" />
                                {level === "provincia" ? "Provincias" : level === "distrito" ? "Distritos" : level === "corregimiento" ? "Corregimientos" : "Comunidades"}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-gray-100">
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Afiliados</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rows.length === 0 && (
                                            <tr><td colSpan={2} className="px-6 py-10 text-center text-slate-400">Sin datos para este nivel.</td></tr>
                                        )}
                                        {rows.map((r) => (
                                            <tr
                                                key={r.id}
                                                onClick={() => {
                                                    if (level === "provincia") onProvince(r.id.toString());
                                                    else if (level === "distrito") onDistrict(r.id.toString());
                                                    else if (level === "corregimiento") onCorregimiento(r.id.toString());
                                                }}
                                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                title="Haz clic para explorar este nivel"
                                            >
                                                <td className="px-6 py-3 font-semibold text-slate-900">
                                                    <span className="inline-flex items-center gap-2">
                                                        {r.name}
                                                        <ChevronDown className="h-3.5 w-3.5 text-slate-300 rotate-[-90deg]" />
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-bold text-blue-600">{r._count?.persons ?? 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {tab === "lider" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <div className="max-w-sm">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Líder</label>
                        <select className={selectCls} value={selectedLeader} onChange={(e) => onLeaderSelect(e.target.value)}>
                            <option value="">Selecciona un líder...</option>
                            {leaders.map((l) => (
                                <option key={l.id} value={l.id}>{leaderName(l)} ({l.role.name}) — {l._count?.persons ?? 0} afiliados</option>
                            ))}
                        </select>
                    </div>

                    {leaderReport && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total afiliados</p>
                                    <p className="text-3xl font-black text-blue-700">{leaderReport.total}</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Comunidades</p>
                                    <p className="text-3xl font-black text-emerald-700">{leaderReport.byCommunity.length}</p>
                                </div>
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Líder</p>
                                    <p className="text-lg font-black text-indigo-700 truncate">{selectedLeaderName ? leaderName(selectedLeaderName) : ""}</p>
                                </div>
                            </div>

                            {leaderReport.byCommunity.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Desglose por comunidad</h3>
                                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Comunidad</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Afiliados</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {leaderReport.byCommunity.map((b: any, i: number) => (
                                                    <tr key={i} className="hover:bg-slate-50">
                                                        <td className="px-6 py-2.5 font-semibold text-slate-900">
                                                            {b.communityId
                                                                ? leaderReport.affiliates.find((a: any) => a.communityId === b.communityId)?.community?.name ?? `Comunidad #${b.communityId}`
                                                                : "Sin comunidad"}
                                                        </td>
                                                        <td className="px-6 py-2.5 text-right font-bold text-blue-600">{b.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" /> Afiliados de {selectedLeaderName ? leaderName(selectedLeaderName) : ""}
                                </h3>
                                {leaderReport.affiliates.length > 0 && (
                                    <button
                                        onClick={() => exportAffiliates(withLeaderName(leaderReport.affiliates), "afiliados_lider")}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        <Download className="h-4 w-4" /> Exportar Excel
                                    </button>
                                )}
                            </div>
                            <AffiliatesTable affiliates={leaderReport.affiliates} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function AffiliatesTable({ affiliates }: { affiliates: Affiliate[] }) {
    if (affiliates.length === 0) {
        return <div className="py-10 text-center text-slate-400">Sin afiliados en este filtro.</div>;
    }
    const location = (a: Affiliate) =>
        [a.province?.name, a.district?.name, a.corregimiento?.name, a.community?.name].filter(Boolean).join(" › ");

    return (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cédula</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Líder que lo registró</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {affiliates.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                            <td className="px-6 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{a.name} {a.lastName}</td>
                            <td className="px-6 py-2.5 text-slate-600 whitespace-nowrap">{a.cedula}</td>
                            <td className="px-6 py-2.5 text-slate-600 whitespace-nowrap">{a.phone || "—"}</td>
                            <td className="px-6 py-2.5 text-slate-600 whitespace-nowrap">
                                {a.leader ? `${a.leader.name} ${a.leader.lastName}${a.leader.role ? ` (${a.leader.role.name})` : ""}` : "—"}
                            </td>
                            <td className="px-6 py-2.5 text-slate-500">{location(a) || "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
