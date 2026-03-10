import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    console.log("Seeding started: Inserting/Updating roles...");
    const roles = [
        { name: "ADMIN", description: "Acceso total al sistema" },
        { name: "Lider Regional", description: "Coordinador de Provincia" },
        { name: "Lider de Zona", description: "Responsable de Distrito" },
        { name: "Comunitario", description: "Líder de Corregimiento/Comunidad" },
        { name: "Activista", description: "Apoyo en campo" },
    ];

    for (const role of roles) {
        console.log(`- Upserting role: ${role.name}`);
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    console.log("Seed completed: Roles inserted/updated.");

    // --- Create Initial Admin User ---
    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) {
        throw new Error("ADMIN role not found after seeding roles.");
    }

    const adminEmail = "admin@example.com";
    console.log(`- Checking for existing admin: ${adminEmail}`);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: "Administrador",
            lastName: "Sistema",
            email: adminEmail,
            passwordHash: "admin123", // Production: use real hashing!
            roleId: adminRole.id,
        }
    });

    console.log("Seed completed: Initial admin user ensured.");
}

main()
    .catch((e) => {
        console.error("SEED_ERROR_MESSAGE:", e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
