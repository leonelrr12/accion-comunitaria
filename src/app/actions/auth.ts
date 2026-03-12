"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function loginAction(email: string, password: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) return { success: false, error: "Usuario no encontrado" };

        // Comparar con bcrypt (soporta hashes nuevos y contraseñas de texto plano en legado)
        const isPlainTextLegacy = user.passwordHash === password;
        const isBcryptMatch = user.passwordHash.startsWith("$2")
            ? await bcrypt.compare(password, user.passwordHash)
            : false;

        if (!isPlainTextLegacy && !isBcryptMatch) {
            return { success: false, error: "Contraseña incorrecta" };
        }

        // Si la contraseña era texto plano, actualizarla al hash ahora mismo
        if (isPlainTextLegacy && !isBcryptMatch) {
            const newHash = await bcrypt.hash(password, 12);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash },
            });
        }

        const sessionPayload = {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            role: user.role.name,
            email: user.email,
            provinceId: user.provinceId,
            districtId: user.districtId,
            corregimientoId: user.corregimientoId,
            communityId: user.communityId,
            inviteCode: user.inviteCode,
        };

        // Guardar sesión en cookie HTTP-only para que el middleware pueda validarla
        const cookieStore = await cookies();
        cookieStore.set("session", JSON.stringify(sessionPayload), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 días
            path: "/",
        });

        return { success: true, user: sessionPayload };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        console.error("Login failed:", error);
        return { success: false, error: message };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
}
