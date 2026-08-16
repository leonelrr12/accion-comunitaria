"use client";

import { useState, useEffect, useTransition } from "react";
import { useAppStore } from "@/lib/store";
import { Shield, Plus, Trash2, Edit2, Check, X, Info, Loader2 } from "lucide-react";
import { getRoles, createRole, updateRoleAction, deleteRoleAction } from "../../../actions/roles";
import { toast } from "sonner";

export default function GestionRoles() {
    const [roles, setRoles] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newRole, setNewRole] = useState({ name: "", description: "", level: 99 });
    const [editRole, setEditRole] = useState({ name: "", description: "", level: 99 });

    // Initial load from DB
    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        const data = await getRoles();
        setRoles(data);
        setLoading(false);
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await createRole(newRole);
            if (result.success) {
                await loadRoles();
                setNewRole({ name: "", description: "", level: 99 });
                setIsAdding(false);
                toast.success("Rol creado con éxito");
            } else {
                toast.error(result.error);
            }
        });
    };

    const startEdit = (role: any) => {
        setEditingId(role.id);
        setEditRole({ name: role.name, description: role.description, level: role.level ?? 99 });
    };

    const handleUpdate = (id: number) => {
        startTransition(async () => {
            const result = await updateRoleAction(id, editRole);
            if (result.success) {
                await loadRoles();
                setEditingId(null);
                toast.success("Rol actualizado");
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm("¿Seguro que quieres eliminar este rol?")) return;

        startTransition(async () => {
            const result = await deleteRoleAction(id);
            if (result.success) {
                await loadRoles();
                toast.success("Rol eliminado");
            } else {
                toast.error(result.error);
            }
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">Cargando roles del sistema...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        Configuración de Roles
                    </h1>
                    <p className="text-slate-500 mt-1">Define los niveles de acceso y perfiles del sistema real.</p>
                </div>
                {/* Los roles son fijos: crear uno requiere programación adicional */}
            </div>

            {/* LISTADO DE ROLES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group relative">
                        {editingId === role.id ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg text-sm font-bold"
                                    value={editRole.name}
                                    onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                                />
                                <textarea
                                    className="w-full p-2 border rounded-lg text-xs"
                                    rows={2}
                                    value={editRole.description}
                                    onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                                />
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-semibold text-slate-500">Nivel (1 = más alto):</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-24 p-1.5 border rounded-lg text-xs"
                                        value={editRole.level}
                                        onChange={(e) => setEditRole({ ...editRole, level: parseInt(e.target.value, 10) || 99 })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdate(role.id)}
                                        disabled={isPending}
                                        className="p-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(role)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(role.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                    {role.name}
                                </h3>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold">
                                    Nivel {role.level ?? 99}
                                </span>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    {role.description}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Info className="h-3 w-3" />
                                    DB ID: {role.id}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
