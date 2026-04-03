"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AffiliateInput } from "@/types";
import { logAction } from "./audit";
import { createSystemNotification } from "./notifications";

interface GetAffiliatesParams {
    leaderUserId?: number;
    page?: number;
    pageSize?: number;
    search?: string;
}

export async function getAffiliates({ leaderUserId, page = 1, pageSize = 10, search = "" }: GetAffiliatesParams = {}) {
    try {
        const searchFilter = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { lastName: { contains: search, mode: "insensitive" as const } },
                    { cedula: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {};

        const where = leaderUserId
            ? { leaderUserId, ...searchFilter }
            : searchFilter;

        const [affiliates, total] = await Promise.all([
            prisma.person.findMany({
                where,
                include: {
                    province: true,
                    district: true,
                    corregimiento: true,
                    community: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.person.count({ where }),
        ]);

        return { data: affiliates, total, totalPages: Math.ceil(total / pageSize) };
    } catch (error) {
        console.error("Error fetching affiliates:", error);
        return { data: [], total: 0, totalPages: 0 };
    }
}

/** Versión sin paginación para uso interno (stats, exports, etc.) */
export async function getAllAffiliates(leaderUserId?: number) {
    try {
        return await prisma.person.findMany({
            where: leaderUserId ? { leaderUserId } : {},
            include: {
                province: true,
                district: true,
                corregimiento: true,
                community: true,
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching all affiliates:", error);
        return [];
    }
}

export async function createAffiliate(data: AffiliateInput) {
    if (!data.leaderUserId) {
        return { success: false, error: "El campo Sponsor/Líder es estrictamente obligatorio." };
    }
    
    try {
        const newPerson = await prisma.person.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                cedula: data.cedula,
                email: data.email,
                phone: data.phone,
                leaderUserId: Number(data.leaderUserId),
                provinceId: data.provinceId ? Number(data.provinceId) : null,
                districtId: data.districtId ? Number(data.districtId) : null,
                corregimientoId: data.corregimientoId ? Number(data.corregimientoId) : null,
                communityId: data.communityId ? Number(data.communityId) : null,
            }
        });

        revalidatePath("/dashboard/afiliados");
        revalidatePath("/dashboard");
        revalidatePath("/admin/dashboard");
        await logAction(data.leaderUserId ? Number(data.leaderUserId) : null, "CREATE_AFFILIATE", `Afiliado registrado: ${data.cedula} (${data.name})`);
        
        if (data.leaderUserId) {
            await createSystemNotification(
                Number(data.leaderUserId),
                "🎉 Nuevo Afiliado Registrado",
                `Has registrado exitosamente a ${newPerson.name} ${newPerson.lastName} (Cédula: ${newPerson.cedula}). ¡Excelente trabajo!`,
                `/dashboard/afiliados/${newPerson.id}`
            );
        }

        return { success: true, person: newPerson };
    } catch (error) {
        console.error("Error creating affiliate:", error);
        const message = error instanceof Error ? error.message : "Error desconocido";
        return { success: false, error: message };
    }
}

export async function getAffiliateById(id: number) {
    try {
        return await prisma.person.findUnique({
            where: { id },
            include: {
                province: true,
                district: true,
                corregimiento: true,
                community: true,
            },
        });
    } catch (error) {
        console.error("Error fetching affiliate:", error);
        return null;
    }
}
