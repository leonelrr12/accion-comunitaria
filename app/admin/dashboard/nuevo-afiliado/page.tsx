"use client";

import AfiliadoForm from "../../../../components/AfiliadoForm";

export default function AdminNuevoAfiliado() {
    return (
        <AfiliadoForm
            redirectTo="/admin/dashboard/afiliados"
            title="Registrar Afiliado (Administración)"
        />
    );
}
