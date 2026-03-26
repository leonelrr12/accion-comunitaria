"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title = "¿Estás seguro?",
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    // Enfocar el botón de cancelar al abrir (más seguro)
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => confirmBtnRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onCancel();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: "bg-red-100 text-red-600",
            btn: "bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-200",
        },
        warning: {
            icon: "bg-amber-100 text-amber-600",
            btn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-200",
        },
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Botón cerrar */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-gray-100 hover:text-slate-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Ícono */}
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colors[variant].icon}`}>
                    <AlertTriangle className="h-6 w-6" />
                </div>

                {/* Contenido */}
                <h2
                    id="confirm-dialog-title"
                    className="text-lg font-bold text-slate-900 text-center mb-2"
                >
                    {title}
                </h2>
                <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Acciones */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors[variant].btn}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
