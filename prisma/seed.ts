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


   console.log("Seeding started: Delete all... GEO");

    await Promise.all([
        prisma.community.deleteMany(),
        prisma.corregimiento.deleteMany(),
        prisma.district.deleteMany(),
        prisma.province.deleteMany(),
    ]);


    console.log("🌱 Iniciando sembrado de base de datos...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    // 1. Crear datos geograficos Iniciales
    const provinces = [
        { id: 1, name: "Bocas" },
        { id: 2, name: "Cocle" },
        { id: 3, name: "Colon" },
        { id: 4, name: "Chiriqui" },
        { id: 5, name: "Darien" },
        { id: 6, name: "Herrera" },
        { id: 7, name: "Los Santos" },
        { id: 8, name: "Panama" },
    ];

    const districts = [
        { id: 1, provinceId: 8, name: "Panama" },
        { id: 2, provinceId: 8, name: "San Miguelito" },
    ];

    const corregimientos = [
        { id: 1, districtId: 2, name: "Amelia Denis De Icaza" },
        { id: 2, districtId: 2, name: 'Belisario Porras'},
        { id: 3, districtId: 2, name: 'José Domigo Espinar'},
        { id: 4, districtId: 2, name: 'Mateo Iturralde'},
        { id: 5, districtId: 2, name: 'Victoriano Lorenzo'},
        { id: 6, districtId: 2, name: 'Arnulfo Arias'},
        { id: 7, districtId: 2, name: 'Belisario Frías'},
        { id: 8, districtId: 2, name: 'Omar Torrijos'},
        { id: 9, districtId: 2, name: 'Rufina Alfaro'},
    ];

    const communities = [
        { id: 1, corregimientoId: 1, name: "Pan de Azúcar" },
        { id: 2, corregimientoId: 1, name: "9 de enero" },
        { id: 3, corregimientoId: 1, name: "Linda Vista" },
        { id: 4, corregimientoId: 1, name: "Condado del Rey" },
        { id: 5, corregimientoId: 1, name: "reparto Panamá" },
        { id: 6, corregimientoId: 1, name: "Fuente del Fresno" },
        { id: 7, corregimientoId: 2, name: "Samaria" },
        { id: 8, corregimientoId: 3, name: "La Pulida" },
        { id: 9, corregimientoId: 3, name: "Villa Lucre" },
        { id: 10, corregimientoId: 3, name: "San Rafael" },
        { id: 11, corregimientoId: 3, name: "El Crisiol" },
        { id: 12, corregimientoId: 3, name: "Los Casiques" },
        { id: 13, corregimientoId: 4, name: "Paraíso" },
        { id: 14, corregimientoId: 4, name: "Villa Guadalupe" },
        { id: 15, corregimientoId: 4, name: "El Cristo" },
        { id: 16, corregimientoId: 5, name: "Monte Oscuro" },
        { id: 17, corregimientoId: 5, name: "Valle de los lagartos" },
        { id: 18, corregimientoId: 6, name: "La Felicidad" },
        { id: 19, corregimientoId: 6, name: "Mano de Piedra" },
        { id: 20, corregimientoId: 6, name: "Roberto Durán (parte)" },
        { id: 21, corregimientoId: 6, name: "El Valle de Urracá" },
        { id: 22, corregimientoId: 6, name: "Loma Bonita" },
        { id: 23, corregimientoId: 6, name: "El Vallecito" },
        { id: 24, corregimientoId: 6, name: "La Paz" },
        { id: 25, corregimientoId: 6, name: "Buena Vista" },
        { id: 26, corregimientoId: 6, name: "La Felicidad" },
        { id: 27, corregimientoId: 6, name: "El Futuro" },
        { id: 28, corregimientoId: 6, name: "Colinas del Golf" },
        { id: 29, corregimientoId: 6, name: "Cerro Cocobolo" },
        { id: 30, corregimientoId: 6, name: "Comarca Emberá" },
        { id: 31, corregimientoId: 6, name: "Altos del Sol" },
        { id: 32, corregimientoId: 6, name: "Palma de Oro" },
        { id: 33, corregimientoId: 7, name: "Torrijos-Carter" },
        { id: 34, corregimientoId: 7, name: "Santa Marta" },
        { id: 35, corregimientoId: 7, name: "Las Colinas" },
        { id: 36, corregimientoId: 7, name: "Veinte de Diciembre" },
        { id: 37, corregimientoId: 7, name: "Torrijos-Carter" },
        { id: 38, corregimientoId: 7, name: "El Esfuerzo" },
        { id: 39, corregimientoId: 7, name: "El Mirador" },
        { id: 40, corregimientoId: 7, name: "Roberto Durán (parte)" },
        { id: 41, corregimientoId: 7, name: "Barriada 2000" },
        { id: 42, corregimientoId: 7, name: "Rogelio Sinán" },
        { id: 43, corregimientoId: 7, name: "Cerro Batea" },
        { id: 44, corregimientoId: 8, name: "Los Andes #2" },
        { id: 45, corregimientoId: 8, name: "Santa Librada (parte)" },
        { id: 46, corregimientoId: 8, name: "Villa Cárdenas" },
        { id: 47, corregimientoId: 8, name: "El Porvenir" },
        { id: 48, corregimientoId: 8, name: "Villa Esperanza" },
        { id: 49, corregimientoId: 8, name: "Los Andes No.2" },
        { id: 50, corregimientoId: 8, name: "Chivo Chivo" },
        { id: 51, corregimientoId: 8, name: "Mocambo Abajo (parte sur)" },
        { id: 52, corregimientoId: 8, name: "El Valle" },
        { id: 53, corregimientoId: 8, name: "El Valle de San Isidro" },
        { id: 54, corregimientoId: 8, name: "San Isidro" },
        { id: 55, corregimientoId: 8, name: "Buenos Aires" },
        { id: 56, corregimientoId: 8, name: "Sonsonate" },
        { id: 57, corregimientoId: 8, name: "Tinajitas" },
        { id: 58, corregimientoId: 8, name: "Villa Georgina" },
        { id: 59, corregimientoId: 8, name: "Los Cipreses" },
        { id: 60, corregimientoId: 8, name: "Campo Verde" },
        { id: 61, corregimientoId: 9, name: "San Antonio" },
        { id: 62, corregimientoId: 9, name: "Colinas Dorasol" },
        { id: 63, corregimientoId: 9, name: "Santa Perá" },
        { id: 64, corregimientoId: 9, name: "Cerro Viento (Rural)" },
        { id: 65, corregimientoId: 9, name: "Altos de Cerro Viento (urbanización)" },
        { id: 66, corregimientoId: 9, name: "Las Trancas" },
        { id: 67, corregimientoId: 9, name: "Villa Flor" },
        { id: 68, corregimientoId: 9, name: "Villa Internacional" },
        { id: 69, corregimientoId: 9, name: "Bulevar San Antonio" },
        { id: 70, corregimientoId: 9, name: "Ciudad Jardín San Antonio" },
        { id: 71, corregimientoId: 9, name: "Brisas del Golf" },
        { id: 72, corregimientoId: 9, name: "Club de Golf de Panamá" },
        { id: 73, corregimientoId: 7, name: "Don Bosco" },
        { id: 74, corregimientoId: 4, name: "Veranillo" },
        { id: 100, corregimientoId: 3, name: "Calle M" },
    ];

    console.log("- Procesando Provincias...");
    for (const obj of provinces) {
        console.log(`- Upserting Provincia: ${obj.name}`);
        await prisma.province.upsert({
        where: { id: obj.id },
        update: {
            name: obj.name,
        },
        create: obj,
        });
    }
    
    console.log("- Procesando Distritos...");
    for (const obj of districts) {
        console.log(`- Upserting Distrito: ${obj.name}`);
        await prisma.district.upsert({
        where: { id: obj.id },
        update: {
            name: obj.name,
        },
        create: obj,
        });
    }

    console.log("- Procesando Corregimientos...");
    for (const obj of corregimientos) {
        console.log(`- Upserting Corregimiento: ${obj.name}`);
        await prisma.corregimiento.upsert({
        where: { id: obj.id },
        update: {
            districtId: obj.districtId,
            name: obj.name,
        },
        create: obj,
        });
    }


    console.log("- Procesando Comunidades...");
    for (const obj of communities) {
        console.log(`- Upserting Comunidad: ${obj.name}`);
        await prisma.community.upsert({
        where: { id: obj.id },
        update: {
            corregimientoId: obj.corregimientoId,
            name: obj.name,
        },
        create: obj,
        });
    }

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
