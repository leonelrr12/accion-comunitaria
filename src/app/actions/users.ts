"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true,
                _count: {
                    select: { persons: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function createUserAction(data: any) {
    try {
        // Find role id from role name
        const role = await prisma.role.findUnique({
            where: { name: data.role }
        });

        if (!role) {
            throw new Error(`Role ${data.role} not found`);
        }

        // Generar inviteCode si es líder (opcional para admin)
        const inviteCode = (data.role !== 'ADMIN')
            ? `${data.name.substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`
            : null;

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                passwordHash: data.password || 'password123', // Default si no viene
                phone: data.phone,
                roleId: role.id,
                createdBy: data.createdBy ? parseInt(String(data.createdBy)) : null,
                provinceId: data.provinceId ? parseInt(String(data.provinceId)) : null,
                districtId: data.districtId ? parseInt(String(data.districtId)) : null,
                corregimientoId: data.corregimientoId ? parseInt(String(data.corregimientoId)) : null,
                communityId: data.communityId ? parseInt(String(data.communityId)) : null,
                inviteCode: inviteCode,
            }
        });

        revalidatePath("/admin/dashboard/usuarios");
        return { success: true, user: newUser };
    } catch (error: any) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
}

export async function getUserByInviteCode(code: string) {
    try {
        if (!code) return null;
        const user = await prisma.user.findUnique({
            where: { inviteCode: code },
            include: { role: true }
        });
        return user;
    } catch (error) {
        console.error("Error finding user by code:", error);
        return null;
    }
}
