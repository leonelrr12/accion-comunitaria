"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LeafletMap = dynamic(() => import("./LeafletMap"), { 
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50/50 rounded-3xl border border-slate-100">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold text-sm">Inicializando Mapa Geográfico...</p>
        </div>
    )
});

export default function MapWrapper({ affiliates }: { affiliates: any[] }) {
    return (
        <div className="h-[500px] w-full rounded-3xl p-1 bg-white border border-slate-200 shadow-xl overflow-hidden relative z-0">
            <LeafletMap affiliates={affiliates} />
        </div>
    );
}
