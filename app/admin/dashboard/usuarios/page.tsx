"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { UserPlus, Shield, ArrowRight, Loader2, Edit2, Trash2, X as CloseIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getUsers, createUserAction, updateUserAction, deleteUserAction } from "../../../actions/users";
import { getRoles } from "../../../actions/roles";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import SearchBar from "../../../../components/ui/SearchBar";
import Pagination from "../../../../components/ui/Pagination";
import { useDebounce } from "../../../../src/lib/useDebounce";
import { mapUserFromDB, mapRoleFromDB } from "@/lib/mappers";
import type { User } from "@/types";

export default function GestionUsuarios() {
    // We still use the store's state for the UI, but we'll sync it with the DB
    const users = useAppStore((state) => state.users);
    const roles = useAppStore((state) => state.roles);
    const currentUser = useAppStore((state) => state.currentUser);

    const setUsers = useAppStore((state) => state.setUsers);
    const setRoles = useAppStore((state) => state.setRoles);

    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; userId: number | string | null }>({
        isOpen: false,
        userId: null,
    });

    // Paginación y búsqueda
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const PAGE_SIZE = 10;
    const debouncedSearch = useDebounce(searchTerm, 350);

    const refreshData = useCallback(async (page = currentPage, search = debouncedSearch) => {
        const [result, dbRoles] = await Promise.all([
            getUsers({ page, pageSize: PAGE_SIZE, search }),
            getRoles(),
        ]);

        const mappedUsers: User[] = result.data.map(mapUserFromDB);
        const mappedRoles = dbRoles.map(mapRoleFromDB);

        setUsers(mappedUsers);
        setRoles(mappedRoles);
        setTotalPages(result.totalPages);
        setTotalUsers(result.total);
        return mappedUsers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearch]);

    // Reset página al cambiar búsqueda
    useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        setIsLoading(true);
        refreshData(currentPage, debouncedSearch).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearch]);

    // Admin Creation State
    const [adminData, setAdminData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "ADMIN",
        parentLeaderId: ""
    });

    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await createUserAction({
                ...adminData,
                createdBy: currentUser?.id
            });

            if (result.success) {
                await refreshData();
                setAdminData({ name: "", lastName: "", email: "", password: "", phone: "", role: "ADMIN", parentLeaderId: "" });
                toast.success("Usuario creado exitosamente");
            } else {
                toast.error("Error al crear usuario: " + result.error);
            }
        });
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        const userId = typeof editingUser.id === 'string' ? parseInt(editingUser.id) : editingUser.id;

        startTransition(async () => {
            const result = await updateUserAction(userId, editingUser);
            if (result.success) {
                await refreshData();
                setEditingUser(null);
                toast.success("Usuario actualizado correctamente");
            } else {
                toast.error("Error: " + result.error);
            }
        });
    };

    const handleDeleteUser = (id: string | number) => {
        setConfirmDialog({ isOpen: true, userId: id });
    };

    const executeDelete = () => {
        const id = confirmDialog.userId;
        if (!id) return;
        setConfirmDialog({ isOpen: false, userId: null });

        const userId = typeof id === 'string' ? parseInt(id) : id;
        startTransition(async () => {
            const result = await deleteUserAction(userId);
            if (result.success) {
                await refreshData();
                toast.success("Usuario eliminado");
            } else {
                toast.error("Error: " + result.error);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Cargando directorio de usuarios...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <UserPlus className="h-8 w-8 text-blue-600" />
                    Gestión de Usuarios y Accesos
                </h1>
            </div>

            {/* SECCIÓN 1: CREACIÓN DE USUARIOS CON ROL DINÁMICO */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Registrar Nuevo Usuario</h2>
                        <p className="text-sm text-slate-500">Selecciona el rol adecuado para definir los permisos.</p>
                    </div>
                </div>

                <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Nombre</label>
                        <input
                            type="text"
                            required
                            disabled={isPending}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={adminData.name}
                            onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Apellido</label>
                        <input
                            type="text"
                            required
                            disabled={isPending}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={adminData.lastName}
                            onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email</label>
                        <input
                            type="email"
                            required
                            disabled={isPending}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={adminData.email}
                            onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                        <input
                            type="password"
                            required
                            disabled={isPending}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={adminData.password}
                            onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Rol del Usuario</label>
                        <select
                            required
                            disabled={isPending}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={adminData.role}
                            onChange={(e) => setAdminData({ ...adminData, role: e.target.value })}
                        >
                            {roles.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                        <input
                            type="tel"
                            disabled={isPending}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={adminData.phone}
                            onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                        />
                    </div>
                    {adminData.role !== "ADMIN" && (
                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                            <label className="text-sm font-semibold text-blue-700">Líder Superior (Jerarquía)</label>
                            <select
                                className="w-full p-3 border border-blue-200 rounded-xl bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={adminData.parentLeaderId}
                                onChange={(e) => setAdminData({ ...adminData, parentLeaderId: e.target.value })}
                                disabled={isPending}
                            >
                                <option value="">Sin Líder (Nivel Superior)</option>
                                {users
                                    .filter(u => u.role !== "ADMIN")
                                    .filter(u => {
                                        if (u.role === "Activista") return false;
                                        if (u.role === "Comunitario" && adminData.role !== "Activista") return false;
                                        return true;
                                    })
                                    .map(u => (
                                        <option key={u.id} value={u.id}>{u.name} {u.lastName} ({u.role})</option>
                                    ))
                                }
                            </select>
                        </div>
                    )}
                    <div className="flex items-end sm:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                            Registrar y Asignar Rol
                        </button>
                    </div>
                </form>
            </div>

            {/* SECCIÓN 2: LÍDERES (ACCESO RÁPIDO CON UBICACIÓN) */}
            <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl text-white flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-2xl">
                        <UserPlus className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Registro de Líderes por Ubicación</h2>
                        <p className="text-slate-400 text-sm">Permite asignar territorio geográfico fijo.</p>
                    </div>
                </div>
                <Link
                    href="/admin/dashboard/nuevo-lider"
                    className="w-full lg:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all flex justify-center items-center gap-2"
                >
                    Registrar por Zona
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>

            {/* TABLA DE USUARIOS EXISTENTES */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                )}
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-bold text-slate-900">Directorio de Personal</h3>
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por nombre, email..."
                        className="w-full sm:w-80"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil / Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Registrado por</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users.map((user) => {
                                const creator = users.find(u => u.id === user.createdBy);
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center font-semibold text-slate-900">
                                                {user.name} {user.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-slate-500">
                                            {creator ? `${creator.name} ${creator.lastName}` : "SISTEMA"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Jerarquía"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Usuario"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay usuarios registrados."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalUsers}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* MODAL DE EDICIÓN */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
                        <div className="px-8 py-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Editar Usuario</h2>
                                <p className="text-xs text-slate-400">Modifica accesos y posición en la jerarquía.</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <CloseIcon className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Nombre</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Apellido</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editingUser.lastName}
                                        onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Perfil / Rol</label>
                                    <select
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    >
                                        {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                {editingUser.role !== "ADMIN" && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-blue-700">Líder Superior</label>
                                        <select
                                            className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={editingUser.parentLeaderId || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, parentLeaderId: e.target.value })}
                                        >
                                            <option value="">Sin Líder (TOP)</option>
                                            {users
                                                .filter(u => u.id !== editingUser.id && u.role !== "ADMIN")
                                                .filter(u => {
                                                    if (u.role === "Activista") return false;
                                                    if (u.role === "Comunitario" && editingUser.role !== "Activista") return false;
                                                    return true;
                                                })
                                                .map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} {u.lastName}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-blue-600 text-white p-4 rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar Cambios"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Diálogo de confirmación de eliminación */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Eliminar usuario"
                message="¿Estás seguro de eliminar este usuario? Se perderán todos sus vínculos jerárquicos y no podrá iniciar sesión."
                confirmLabel="Sí, eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={executeDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, userId: null })}
            />
        </div>
    );
}