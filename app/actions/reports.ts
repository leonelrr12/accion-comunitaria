"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

// ─── Reportes (solo ADMIN) ───────────────────────────────────────────────────
// Conteos por nivel geográfico + afiliados por comunidad/líder.

export async function getProvinceBreakdown() {
    try {
        await requireAdmin();
        return await prisma.province.findMany({
            select: { id: true, name: true, _count: { select: { persons: true } } },
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error en getProvinceBreakdown:", error);
        return [];
    }
}

export async function getDistrictBreakdown(provinceId: number) {
    try {
        await requireAdmin();
        return await prisma.district.findMany({
            where: { provinceId },
            select: { id: true, name: true, _count: { select: { persons: true } } },
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error en getDistrictBreakdown:", error);
        return [];
    }
}

export async function getCorregimientoBreakdown(districtId: number) {
    try {
        await requireAdmin();
        return await prisma.corregimiento.findMany({
            where: { districtId },
            select: { id: true, name: true, _count: { select: { persons: true } } },
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error en getCorregimientoBreakdown:", error);
        return [];
    }
}

export async function getCommunityBreakdown(corregimientoId: number) {
    try {
        await requireAdmin();
        return await prisma.community.findMany({
            where: { corregimientoId },
            select: { id: true, name: true, _count: { select: { persons: true } } },
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error en getCommunityBreakdown:", error);
        return [];
    }
}

// Afiliados de un corregimiento (todas sus comunidades, con el líder que los trajo)
export async function getCorregimientoAffiliates(corregimientoId: number) {
    try {
        await requireAdmin();
        return await prisma.person.findMany({
            where: { corregimientoId },
            include: {
                leader: { select: { id: true, name: true, lastName: true, role: { select: { name: true } } } },
                province: { select: { name: true } },
                district: { select: { name: true } },
                corregimiento: { select: { name: true } },
                community: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error en getCorregimientoAffiliates:", error);
        return [];
    }
}

// Afiliados de una comunidad (con el líder que los trajo)
export async function getCommunityAffiliates(communityId: number, leaderUserId?: number) {
    try {
        await requireAdmin();
        return await prisma.person.findMany({
            where: {
                communityId,
                ...(leaderUserId ? { leaderUserId } : {}),
            },
            include: {
                leader: { select: { id: true, name: true, lastName: true, role: { select: { name: true } } } },
                community: true,
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error en getCommunityAffiliates:", error);
        return [];
    }
}

// Afiliados de un líder + desglose por comunidad + totales
export async function getAffiliatesByLeader(leaderUserId: number) {
    try {
        await requireAdmin();
        const [affiliates, byCommunity, total] = await Promise.all([
            prisma.person.findMany({
                where: { leaderUserId },
                include: {
                    leader: { select: { id: true, name: true, lastName: true } },
                    province: { select: { name: true } },
                    district: { select: { name: true } },
                    corregimiento: { select: { name: true } },
                    community: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.person.groupBy({
                by: ["communityId"],
                where: { leaderUserId },
                _count: { _all: true },
            }),
            prisma.person.count({ where: { leaderUserId } }),
        ]);

        return {
            affiliates,
            total,
            byCommunity: byCommunity.map((b) => ({
                communityId: b.communityId,
                count: b._count._all,
            })),
        };
    } catch (error) {
        console.error("Error en getAffiliatesByLeader:", error);
        return { affiliates: [], total: 0, byCommunity: [] };
    }
}

// Líderes con afiliados para el selector de reportes
export async function getLeadersForReport() {
    try {
        await requireAdmin();
        return await prisma.user.findMany({
            where: { role: { name: { not: "ADMIN" } } },
            select: {
                id: true,
                name: true,
                lastName: true,
                role: { select: { name: true } },
                _count: { select: { persons: true } },
            },
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Error en getLeadersForReport:", error);
        return [];
    }
}
