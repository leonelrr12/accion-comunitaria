"use client";

import { Search, X } from "lucide-react";
import { useRef } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({
    value,
    onChange,
    placeholder = "Buscar...",
    className = "",
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
        onChange("");
        inputRef.current?.focus();
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
                ref={inputRef}
                id="search-bar"
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-9 py-2.5 text-sm text-slate-800 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all"
                autoComplete="off"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                    aria-label="Limpiar búsqueda"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
