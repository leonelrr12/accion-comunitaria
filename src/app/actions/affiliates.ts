"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAffiliates(leaderUserId?: number) {
    try {
        const affiliates = await prisma.person.findMany({
            where: leaderUserId ? { leaderUserId } : {},
            include: {
                province: true,
                district: true,
                corregimiento: true,
                community: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return affiliates;
    } catch (error) {
        console.error("Error fetching affiliates:", error);
        return [];
    }
}

export async function createAffiliate(data: any) {
    try {
        const newPerson = await prisma.person.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                cedula: data.cedula,
                email: data.email,
                phone: data.phone,
                leaderUserId: data.leaderUserId ? parseInt(data.leaderUserId) : null,
                provinceId: data.provinceId ? parseInt(data.provinceId) : null,
                districtId: data.districtId ? parseInt(data.districtId) : null,
                corregimientoId: data.corregimientoId ? parseInt(data.corregimientoId) : null,
                communityId: data.communityId ? parseInt(data.communityId) : null,
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
