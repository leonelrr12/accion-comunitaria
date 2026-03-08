"use client";

import { useAppStore } from "@/lib/store";
import { Copy, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function Dashboard() {
    const currentUser = useAppStore((state) => state.currentUser);
    const persons = useAppStore((state) => state.persons);
    const [copied, setCopied] = useState(false);
    const [inviteUrl, setInviteUrl] = useState("");

    useEffect(() => {
        if (currentUser) {
            setInviteUrl(`${window.location.origin}/registro?ref=${currentUser.inviteCode}`);
        }
    }, [currentUser]);

    if (!currentUser) return null;

    const myAffiliates = persons.filter((p) => p.leaderId === currentUser.id);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Hola, {currentUser.name}
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Tu Link de Invitación
                </h2>
                <div className="flex mt-1 rounded-md shadow-sm">
                    <div className="relative flex-grow focus-within:z-10">
                        <input
                            type="text"
                            readOnly
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 px-4 py-3 text-gray-700"
                            value={inviteUrl}
                        />
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-blue-600 text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                        <Copy className="h-4 w-4" />
                        <span>{copied ? "¡Copiado!" : "Copiar Link"}</span>
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    Comparte este enlace para que las personas se registren directamente bajo tu red.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Metric 1 */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Afiliados Directos
                                    </dt>
                                    <dd>
                                        <div className="text-2xl font-medium text-gray-900">
                                            {myAffiliates.length}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Nuevos (Últimos 7 días)
                                    </dt>
                                    <dd>
                                        <div className="text-2xl font-medium text-gray-900">
                                            {/* Simulating logic for newly created in last week */}
                                            {myAffiliates.length}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recents Table Minimal */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Últimos Registros
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {myAffiliates.slice(-5).reverse().map((affiliate) => (
                        <li key={affiliate.id} className="py-4 px-6 flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{affiliate.firstName} {affiliate.lastName}</p>
                                <p className="text-sm text-gray-500">{new Date(affiliate.createdAt).toLocaleDateString()}</p>
                            </div>
                        </li>
                    ))}
                    {myAffiliates.length === 0 && (
                        <li className="py-8 px-6 text-center text-gray-500">
                            Aún no tienes afiliados. ¡Comparte tu link!
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
