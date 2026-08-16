"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { resetPasswordAction } from "../actions/password";

function RestablecerForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isPending, startTransition] = useTransition();
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (password !== confirm) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        startTransition(async () => {
            const result = await resetPasswordAction(token, password);
            if (result?.error) {
                setError(result.error);
                return;
            }
            setDone(true);
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <KeyRound className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Nueva contraseña</h1>
                            <p className="text-sm text-slate-500">Acción Comunitaria</p>
                        </div>
                    </div>

                    {done ? (
                        <div className="text-center py-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="text-slate-700 font-medium">¡Contraseña actualizada!</p>
                            <p className="text-sm text-slate-500 mt-1">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                            <Link href="/login" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl text-sm">
                                Iniciar sesión
                            </Link>
                        </div>
                    ) : !token ? (
                        <div className="text-center py-4">
                            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                            <p className="text-slate-700 font-medium">Enlace inválido</p>
                            <p className="text-sm text-slate-500 mt-1">El enlace no tiene token. Solicita uno nuevo.</p>
                            <Link href="/recuperar-contrasena" className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                                Recuperar contraseña
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Nueva contraseña</label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1">Confirmar contraseña</label>
                                <input
                                    id="confirm"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Repite la contraseña"
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar contraseña"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function RestablecerContrasenaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Cargando...</div>}>
            <RestablecerForm />
        </Suspense>
    );
}
