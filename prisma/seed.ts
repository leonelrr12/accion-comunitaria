import "dotenv/config";
//import { PrismaClient } from "@prisma/client";
import { prisma } from '../src/lib/prisma';  

//export const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando sembrado de base de datos...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    // 1. Crear Roles Iniciales
    const roles = [
        { name: "ADMIN", description: "Acceso total al sistema" },
        { name: "Lider Regional", description: "Coordinador de Provincia" },
        { name: "Lider de Zona", description: "Responsable de Distrito" },
        { name: "Comunitario", description: "Líder de Corregimiento/Comunidad" },
        { name: "Activista", description: "Apoyo en campo" },
    ];

    console.log("- Procesando roles...");
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    // 2. Obtener ID del Rol Admin
    const adminRole = await prisma.role.findUnique({
        where: { name: "ADMIN" }
    });

    if (!adminRole) {
        throw new Error("No se pudo encontrar el rol ADMIN tras el sembrado.");
    }

    // 3. Crear Usuario Administrador Inicial
    const adminEmail = "admin@example.com";
    console.log(`- Verificando administrador inicial (${adminEmail})...`);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: "Administrador",
            lastName: "Principal",
            email: adminEmail,
            passwordHash: "admin123", // IMPORTANTE: En producción usar bcrypt
            roleId: adminRole.id,
            inviteCode: "ADMIN001",
            phone: "00000000",
            createdAt: new Date(),
        },
    });

    console.log("✅ Sembrado completado con éxito.");
}

main()
    .catch((e) => {
        console.error("❌ Error en el sembrado:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
