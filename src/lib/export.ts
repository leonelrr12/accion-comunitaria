import * as XLSX from "xlsx";

/**
 * Utility to export data to CSV and download it in the browser.
 */
export function exportToCSV(data: any[], filename: string, headers: { label: string; key: string }[]) {
    if (!data || !data.length) return;

    const csvContent = [
        // Headers
        headers.map(h => `"${h.label}"`).join(","),
        // Rows
        ...data.map(row =>
            headers.map(h => {
                const value = h.key.split('.').reduce((acc, part) => acc && acc[part], row);
                const stringValue = value === null || value === undefined ? "" : String(value);
                // Escape quotes
                return `"${stringValue.replace(/"/g, '""')}"`;
            }).join(",")
        )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Exporta datos a un archivo Excel real (.xlsx) usando SheetJS.
 */
export function exportToXLSX(data: any[], filename: string, headers: { label: string; key: string }[]) {
    if (!data || !data.length) return;

    const rows = data.map((row) => {
        const out: Record<string, string> = {};
        for (const h of headers) {
            const value = h.key.split(".").reduce((acc: any, part) => acc && acc[part], row);
            out[h.label] = value === null || value === undefined ? "" : String(value);
        }
        return out;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

