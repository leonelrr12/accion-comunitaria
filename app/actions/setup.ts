"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function initialSetup() {
    try {
        // Bootstrap: solo permitido mientras el sistema no tenga usuarios
        const existingUsers = await prisma.user.count();
        if (existingUsers > 0) {
            throw new Error("El sistema ya fue inicializado. Contacta al administrador.");
        }
        // 1. Crear Roles
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

        // 2. Crear Admin inicial con contraseña hasheada
        const adminEmail = "admin@example.com";
        const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (!existingAdmin && adminRole) {
            const passwordHash = await bcrypt.hash("admin123", 12);
            await prisma.user.create({
                data: {
                    name: "Admin",
                    lastName: "General",
                    email: adminEmail,
                    passwordHash,
                    roleId: adminRole.id,
                    inviteCode: "ADMIN001",
                },
            });
        }

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        console.error("Setup failed:", error);
        return { success: false, error: message };
    }
}
