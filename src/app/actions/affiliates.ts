"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AffiliateInput } from "@/types";

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
    try {
        const newPerson = await prisma.person.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                cedula: data.cedula,
                email: data.email,
                phone: data.phone,
                leaderUserId: data.leaderUserId ? Number(data.leaderUserId) : null,
                provinceId: data.provinceId ? Number(data.provinceId) : null,
                districtId: data.districtId ? Number(data.districtId) : null,
                corregimientoId: data.corregimientoId ? Number(data.corregimientoId) : null,
                communityId: data.communityId ? Number(data.communityId) : null,
            }
        });

        revalidatePath("/dashboard/afiliados");
        revalidatePath("/dashboard");
        revalidatePath("/admin/dashboard");
        return { success: true, person: newPerson };
    } catch (error: any) {
        console.error("Error creating affiliate:", error);
        return { success: false, error: error.message };
    }
}
