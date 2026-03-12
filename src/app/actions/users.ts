"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { CreateUserInput, UpdateUserInput } from "@/types";

interface GetUsersParams {
    page?: number;
    pageSize?: number;
    search?: string;
}

export async function getUsers({ page = 1, pageSize = 10, search = "" }: GetUsersParams = {}) {
    try {
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { lastName: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    role: true,
                    _count: { select: { persons: true } },
                    leaders: { include: { leader: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.user.count({ where }),
        ]);

        return { data: users, total, totalPages: Math.ceil(total / pageSize) };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { data: [], total: 0, totalPages: 0 };
    }
}

/** Versión sin paginación para uso interno (dashboard stats, jerarquía, etc.) */
export async function getAllUsers() {
    try {
        return await prisma.user.findMany({
            include: {
                role: true,
                _count: { select: { persons: true } },
                leaders: { include: { leader: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

export async function createUserAction(data: CreateUserInput) {
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

        const passwordToHash = data.password || "changeme123";
        const passwordHash = await bcrypt.hash(passwordToHash, 12);

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                passwordHash,
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

        // 3. Si se proporcionó un líder superior, validar jerarquía y crear registro
        if (data.parentLeaderId) {
            const parentLeader = await prisma.user.findUnique({
                where: { id: parseInt(String(data.parentLeaderId)) },
                include: { role: true }
            });

            if (parentLeader) {
                // Validación 1: El activista no puede liderar a nadie
                if (parentLeader.role.name === "Activista") {
                    throw new Error("Un Activista no puede ser líder superior de nadie.");
                }

                // Validación 2: El comunitario solo puede ser líder del Activista
                if (parentLeader.role.name === "Comunitario" && data.role !== "Activista") {
                    throw new Error("Un Comunitario solo puede liderar a usuarios con rol de Activista.");
                }

                await prisma.userHierarchy.create({
                    data: {
                        leaderId: parentLeader.id,
                        subordinateId: newUser.id,
                        level: 1
                    }
                });
            }
        }

        revalidatePath("/admin/dashboard/usuarios");
        revalidatePath("/admin/dashboard");
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

export async function getHierarchy() {
    try {
        const hierarchy = await prisma.user.findMany({
            where: {
                role: {
                    name: { not: "ADMIN" }
                }
            },
            include: {
                role: true,
                subordinates: {
                    include: {
                        subordinate: {
                            include: { role: true }
                        }
                    }
                }
            }
        });
        return hierarchy;
    } catch (error) {
        console.error("Error fetching hierarchy:", error);
        return [];
    }
}

export async function updateUserAction(id: number, data: UpdateUserInput) {
    try {
        const role = await prisma.role.findUnique({
            where: { name: data.role }
        });

        if (!role) throw new Error(`Role ${data.role} not found`);

        // 1. Actualizar info básica
        await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                roleId: role.id
            }
        });

        // 2. Actualizar Jerarquía
        if (data.parentLeaderId !== undefined) {
            // Eliminar vínculos existentes como subordinado
            await prisma.userHierarchy.deleteMany({
                where: { subordinateId: id }
            });

            if (data.parentLeaderId) {
                const parentId = parseInt(String(data.parentLeaderId));

                // Evitar que el usuario sea su propio líder
                if (parentId === id) throw new Error("Un usuario no puede ser su propio líder.");

                const parentLeader = await prisma.user.findUnique({
                    where: { id: parentId },
                    include: { role: true }
                });

                if (parentLeader) {
                    // Validaciones de Jerarquía
                    if (parentLeader.role.name === "Activista") {
                        throw new Error("Un Activista no puede ser líder superior de nadie.");
                    }
                    if (parentLeader.role.name === "Comunitario" && data.role !== "Activista") {
                        throw new Error("Un Comunitario solo puede liderar a usuarios con rol de Activista.");
                    }

                    await prisma.userHierarchy.create({
                        data: {
                            leaderId: parentId,
                            subordinateId: id,
                            level: 1
                        }
                    });
                }
            }
        }

        revalidatePath("/admin/dashboard/usuarios");
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/dashboard/jerarquia");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteUserAction(id: number) {
    try {
        // Eliminar vínculos de jerarquía primero
        await prisma.userHierarchy.deleteMany({
            where: {
                OR: [
                    { leaderId: id },
                    { subordinateId: id }
                ]
            }
        });

        await prisma.user.delete({
            where: { id }
        });

        revalidatePath("/admin/dashboard/usuarios");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { success: false, error: error.message };
    }
}
