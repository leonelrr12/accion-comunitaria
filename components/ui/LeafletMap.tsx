"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default Leaflet icons in Next.js/Browser environment
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

export default function LeafletMap({ affiliates }: { affiliates: any[] }) {
    // San Miguelito coordinates approximate
    const defaultCenter: [number, number] = [9.052, -79.489];
    
    // Hardcoded approximate coordinates for San Miguelito corregimientos to display hotspots
    const coordsMap: Record<string, [number, number]> = {
        "Amelia Denis De Icaza": [9.043, -79.510],
        "Belisario Porras": [9.055, -79.497],
        "José Domingo Espinar": [9.048, -79.482],
        "Mateo Iturralde": [9.034, -79.499],
        "Victoriano Lorenzo": [9.025, -79.507],
        "Arnulfo Arias": [9.071, -79.495],
        "Belisario Frías": [9.082, -79.489],
        "Omar Torrijos": [9.068, -79.483],
        "Rufina Alfaro": [9.058, -79.462],
    };

    return (
        <MapContainer center={defaultCenter} zoom={13} style={{ height: "500px", width: "100%", borderRadius: "1.5rem", zIndex: 1 }} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Object.entries(coordsMap).map(([name, coords]) => {
                // Ignore accent differences and whitespace
                const count = affiliates.filter(a => {
                    const dbName = (a.corregimiento?.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    const mapName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    return dbName === mapName;
                }).length;
                
                if (count === 0) return null;
                
                return (
                    <CircleMarker 
                        key={name}
                        center={coords}
                        radius={Math.max(15, Math.min(50, count * 3))} // scale size by count, min 15, max 50
                        fillColor="#10b981"
                        color="#059669"
                        weight={2}
                        fillOpacity={0.7}
                    >
                        <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                            <div className="text-center p-1">
                                <p className="font-black text-slate-800 text-sm">{name}</p>
                                <p className="text-slate-600 border-t mt-2 pt-2"><span className="font-black text-emerald-600 text-xl">{count}</span> afiliados</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                )
            })}
        </MapContainer>
    );
}
