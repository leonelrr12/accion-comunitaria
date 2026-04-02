"use server";

import { prisma } from "@/lib/prisma";

export async function logAction(userId: number | null, action: string, details: string, ipAddress?: string) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                details,
                ipAddress,
            },
        });
    } catch (error) {
        console.error("Error logging action:", error);
    }
}

export async function getAuditLogs(limit: number = 50) {
    try {
        return await prisma.auditLog.findMany({
            include: { user: { select: { name: true, lastName: true, role: { select: { name: true } } } } },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
}
