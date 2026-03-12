"use client";

import { useEffect, useState } from "react";

/**
 * Retrasa la actualización de un valor hasta que el usuario deje de escribir.
 * Ideal para búsquedas que disparan peticiones al servidor.
 *
 * @param value  Valor a "debouncear"
 * @param delayMs  Milisegundos de espera (default: 300ms)
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debouncedValue;
}
