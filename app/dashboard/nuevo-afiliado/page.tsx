"use client";

import { useAppStore } from "@/lib/store";
import AfiliadoForm from "../../../components/AfiliadoForm";

export default function NuevoAfiliado() {
    const currentUser = useAppStore((state) => state.currentUser);

    return (
        <AfiliadoForm
            defaultLeaderId={currentUser?.id?.toString() || ""}
            redirectTo="/dashboard/afiliados"
        />
    );
}
