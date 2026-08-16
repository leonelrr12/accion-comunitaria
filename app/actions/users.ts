"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { CreateUserInput, UpdateUserInput } from "@/types";
import { logAction } from "./audit";
import { issuePasswordResetForUser } from "./password";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";

interface GetUsersParams {
    page?: number;
    pageSize?: number;
    search?: string;
}

export async function getUsers({ page = 1, pageSize = 10, search = "" }: GetUsersParams = {}) {
    try {
        await requireAdmin();
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
        // Creación jerárquica: cualquier rol logueado crea roles de nivel inferior
        const session = await requireAuth();
        const creatorRole = await prisma.role.findUnique({ where: { name: session.role as string } });
        // Find role id from role name
        const role = await prisma.role.findUnique({
            where: { name: data.role }
        });

        if (!role) {
            throw new Error(`Role ${data.role} not found`);
        }

        if (creatorRole && role.level <= creatorRole.level) {
            throw new Error("No puedes crear un usuario con un rol igual o superior al tuyo.");
        }

        // Generar inviteCode si es líder (opcional para admin)
        const inviteCode = (data.role !== 'ADMIN')
            ? `${data.name.substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`
            : null;

        const isTempPassword = true; //!data.password;
        const passwordToHash = "123456"; //data.password || Math.random().toString(36).substring(2, 10);
        const passwordHash = await bcrypt.hash(passwordToHash, 12);

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                passwordHash,
                phone: data.phone,
                roleId: role.id,
                mustChangePassword: isTempPassword,
                createdBy: data.createdBy ? parseInt(String(data.createdBy), 10) : null,
                provinceId: data.provinceId ? parseInt(String(data.provinceId), 10) : null,
                districtId: data.districtId ? parseInt(String(data.districtId), 10) : null,
                corregimientoId: data.corregimientoId ? parseInt(String(data.corregimientoId), 10) : null,
                communityId: data.communityId ? parseInt(String(data.communityId), 10) : null,
                inviteCode: inviteCode,
            }
        });

        // 3. Líder superior: por defecto el propio creador; si se indica otro, validar jerarquía
        const parentLeaderId = data.parentLeaderId ? parseInt(String(data.parentLeaderId)) : session.id;
        if (parentLeaderId) {
            const parentLeader = await prisma.user.findUnique({
                where: { id: parentLeaderId },
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

        // 4. Enviar correo de bienvenida con link para definir contraseña
        // (no se expone la contraseña temporal en el correo; el link es de un solo uso, 1 hora)
        try {
            await issuePasswordResetForUser(
                newUser.id,
                newUser.email,
                `${newUser.name} ${newUser.lastName}`,
                newUser.inviteCode
            );
        } catch (emailError) {
            console.error("Error enviando correo de bienvenida:", emailError);
            // El alta no falla si el correo no sale; el usuario puede usar la contraseña temporal
        }

        revalidatePath("/admin/dashboard/usuarios");
        revalidatePath("/admin/dashboard");
        await logAction(data.createdBy ? parseInt(String(data.createdBy), 10) : null, "CREATE_USER", `Creado líder/usuario ${newUser.email} con rol ${data.role}`);
        return { success: true, user: newUser, tempPassword: isTempPassword ? passwordToHash : undefined };
    } catch (error) {
        console.error("Error creating user:", error);
        const message = error instanceof Error ? error.message : "Error desconocido";
        return { success: false, error: message };
    }
}

// Mi equipo: usuarios bajo mi liderazgo (para la vista Gestión de Activistas)
export async function getMyActivists() {
    try {
        const session = await requireAuth();
        const team = await prisma.userHierarchy.findMany({
            where: { leaderId: session.id },
            include: {
                subordinate: {
                    include: {
                        role: true,
                        province: true,
                        district: true,
                        corregimiento: true,
                        community: true,
                        _count: { select: { persons: true } },
                        subordinates: { select: { id: true } },
                    },
                },
            },
            orderBy: { id: "asc" },
        });

        return team.map((t) => ({
            id: t.subordinate.id,
            name: t.subordinate.name,
            lastName: t.subordinate.lastName,
            email: t.subordinate.email,
            phone: t.subordinate.phone,
            role: t.subordinate.role.name,
            province: t.subordinate.province?.name ?? null,
            district: t.subordinate.district?.name ?? null,
            corregimiento: t.subordinate.corregimiento?.name ?? null,
            community: t.subordinate.community?.name ?? null,
            afiliados: t.subordinate._count.persons,
            teamSize: t.subordinate.subordinates.length,
            createdAt: t.subordinate.createdAt,
        }));
    } catch (error) {
        console.error("Error fetching my team:", error);
        return [];
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
        await requireAdmin();
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
        // Edición jerárquica: solo usuarios con rol inferior al del creador
        const session = await requireAuth();
        const creatorRole = await prisma.role.findUnique({ where: { name: session.role as string } });
        const targetUser = await prisma.user.findUnique({ where: { id }, include: { role: true } });
        if (targetUser && creatorRole && targetUser.role.level <= creatorRole.level) {
            throw new Error("Solo puedes editar usuarios con un rol inferior al tuyo.");
        }
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
                roleId: role.id,
                provinceId: data.provinceId ? parseInt(String(data.provinceId)) : null,
                districtId: data.districtId ? parseInt(String(data.districtId)) : null,
                corregimientoId: data.corregimientoId ? parseInt(String(data.corregimientoId)) : null,
                communityId: data.communityId ? parseInt(String(data.communityId)) : null,
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
        await logAction(null, "UPDATE_USER", `Actualizado usuario ID ${id} al rol ${data.role}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        const message = error instanceof Error ? error.message : "Error desconocido";
        return { success: false, error: message };
    }
}

export async function deleteUserAction(id: number) {
    try {
        await requireAdmin();
        // No se puede borrar un usuario/líder con afiliados o subordinados a su cargo
        const [afiliados, subordinados] = await Promise.all([
            prisma.person.count({ where: { leaderUserId: id } }),
            prisma.userHierarchy.count({ where: { leaderId: id } }),
        ]);
        if (afiliados > 0) {
            throw new Error(`No se puede eliminar: tiene ${afiliados} afiliado(s) bajo su liderazgo. Reasigna o elimina sus afiliados primero.`);
        }
        if (subordinados > 0) {
            throw new Error(`No se puede eliminar: tiene ${subordinados} usuario(s) bajo su cargo. Reasigna o elimina esos usuarios primero.`);
        }
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
        await logAction(null, "DELETE_USER", `Eliminado usuario ID ${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        const message = error instanceof Error ? error.message : "Error desconocido";
        return { success: false, error: message };
    }
}
