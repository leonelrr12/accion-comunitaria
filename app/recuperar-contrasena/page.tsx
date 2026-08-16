"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { forgotPasswordAction } from "../actions/password";

export default function RecuperarContrasenaPage() {
    const [email, setEmail] = useState("");
    const [isPending, startTransition] = useTransition();
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await forgotPasswordAction(email.trim());
            if (result?.error) {
                setError(result.error);
                return;
            }
            setSent(true);
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Recuperar contraseña</h1>
                            <p className="text-sm text-slate-500">Acción Comunitaria</p>
                        </div>
                    </div>

                    {sent ? (
                        <div className="text-center py-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="text-slate-700 font-medium">Revisa tu correo</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña (válido por 1 hora).
                            </p>
                            <Link href="/login" className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                            </p>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="correo@ejemplo.com"
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
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar enlace"}
                            </button>
                            <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                                <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
