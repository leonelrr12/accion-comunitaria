"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth-guard";

import { revalidatePath } from "next/cache";

export async function getRoles() {
    try {
        await requireAuth();
        const roles = await prisma.role.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return roles;
    } catch (error) {
        console.error("Error fetching roles:", error);
        return [];
    }
}

export async function createRole(data: { name: string, description: string, level?: number }) {
    try {
        await requireAdmin();
        const role = await prisma.role.create({ data });
        revalidatePath("/admin/dashboard/roles");
        return { success: true, role };
    } catch (error) {
        console.error("Error creating role:", error);
        return { success: false, error: "Error al crear el rol" };
    }
}

export async function updateRoleAction(id: number, data: { name?: string, description?: string, level?: number }) {
    try {
        await requireAdmin();
        const role = await prisma.role.update({
            where: { id },
            data
        });
        revalidatePath("/admin/dashboard/roles");
        return { success: true, role };
    } catch (error) {
        console.error("Error updating role:", error);
        return { success: false, error: "Error al actualizar el rol" };
    }
}

export async function deleteRoleAction(id: number) {
    try {
        await requireAdmin();
        await prisma.role.delete({ where: { id } });
        revalidatePath("/admin/dashboard/roles");
        return { success: true };
    } catch (error) {
        console.error("Error deleting role:", error);
        return { success: false, error: "Error al eliminar el rol" };
    }
}
