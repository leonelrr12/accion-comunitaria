"use server";

import prisma from "@/lib/prisma";

export async function loginAction(email: string, passwordHash: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: true,
            }
        });

        if (!user) return { success: false, error: "Usuario no encontrado" };

        // In this stage, we compare against passwordHash directly for the mock password
        // Production: use bcrypt.compare
        if (user.passwordHash !== passwordHash) {
            return { success: false, error: "Contraseña incorrecta" };
        }

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                role: user.role.name,
                email: user.email,
                provinceId: user.provinceId,
                districtId: user.districtId,
                corregimientoId: user.corregimientoId,
                communityId: user.communityId,
                inviteCode: user.inviteCode,
            }
        };
    } catch (error: any) {
        console.error("Login failed:", error);
        return { success: false, error: error.message };
    }
}
