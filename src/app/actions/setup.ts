"use server";

import prisma from "@/lib/prisma";

export async function initialSetup() {
    try {
        // 1. Create Roles
        const roleData = [
            { name: "ADMIN", description: "Acceso total al sistema" },
            { name: "Lider Regional", description: "Coordinador de Provincia" },
            { name: "Lider de Zona", description: "Responsable de Distrito" },
            { name: "Comunitario", description: "Líder de Corregimiento/Comunidad" },
            { name: "Activista", description: "Apoyo en campo" },
        ];

        for (const role of roleData) {
            await prisma.role.upsert({
                where: { name: role.name },
                update: {},
                create: role,
            });
        }

        const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });

        // 2. Create Initial Admin
        const adminEmail = "admin@example.com";
        const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (!existingAdmin && adminRole) {
            await prisma.user.create({
                data: {
                    name: "Admin",
                    lastName: "General",
                    email: adminEmail,
                    passwordHash: "admin123", // In production hash this
                    roleId: adminRole.id,
                    inviteCode: "ADMIN001",
                }
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Setup failed:", error);
        return { success: false, error: error.message };
    }
}
