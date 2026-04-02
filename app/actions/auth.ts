"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validation";
import { encrypt } from "@/lib/auth-utils";

export async function loginAction(
    emailOrFormData: string | FormData,
    passwordParam?: string
) {
    let email: string;
    let passwordValue: string;

    // Handle both string parameters and FormData
    if (typeof emailOrFormData === "object" && emailOrFormData instanceof FormData) {
        email = emailOrFormData.get("email") as string;
        passwordValue = emailOrFormData.get("password") as string;
    } else {
        email = emailOrFormData as string;
        passwordValue = passwordParam as string;
    }

    // Validate input with Zod
    const validation = loginSchema.safeParse({
        email,
        password: passwordValue,
    });

    if (!validation.success) {
        const errors = validation.error.issues.map((e) => e.message).join(", ");
        return { success: false, error: errors };
    }

    const { email: validEmail, password: validPassword } = validation.data;

    // Check rate limit (5 attempts per 15 minutes)
    const clientIp = "default";
    const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
        return {
            success: false,
            error: `Demasiados intentos. Intenta de nuevo en ${rateLimit.resetInSeconds} segundos`,
            rateLimited: true,
            resetIn: rateLimit.resetInSeconds,
        };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: validEmail },
            include: { role: true },
        });

        if (!user) {
            return {
                success: false,
                error: "Usuario no encontrado",
                remainingAttempts: rateLimit.remainingAttempts,
            };
        }

        // Compare password (supports both bcrypt and legacy plaintext)
        const isPlainTextLegacy = user.passwordHash === validPassword;
        const isBcryptMatch = user.passwordHash.startsWith("$2")
            ? await bcrypt.compare(validPassword, user.passwordHash)
            : false;

        if (!isPlainTextLegacy && !isBcryptMatch) {
            return {
                success: false,
                error: "Contraseña incorrecta",
                remainingAttempts: rateLimit.remainingAttempts,
            };
        }

        // Upgrade plaintext password to bcrypt
        if (isPlainTextLegacy && !isBcryptMatch) {
            const newHash = await bcrypt.hash(validPassword, 12);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash, lastLogin: new Date() },
            });
        } else {
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
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
            mustChangePassword: user.mustChangePassword,
        };

        // Save session in HTTP-only cookie
        const encryptedSession = await encrypt(sessionPayload);
        const cookieStore = await cookies();
        cookieStore.set("session", encryptedSession, {
            httpOnly: true,
            // ********************************************************
            secure: false, //process.env.NODE_ENV === "production",
            // ********************************************************
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
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

export async function changePasswordAction(password: string) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
        return { success: false, error: "No session found" };
    }

    const session = await import("@/lib/auth-utils").then(m => m.decrypt(sessionCookie.value));
    if (!session) {
        return { success: false, error: "Invalid session" };
    }

    try {
        const newHash = await bcrypt.hash(password, 12);
        
        await prisma.user.update({
            where: { id: session.id },
            data: { 
                passwordHash: newHash,
                mustChangePassword: false 
            },
        });

        // Update the session via redefining the session object payload
        const newSessionPayload = {
            ...session,
            mustChangePassword: false,
        };

        const encryptedSession = await import("@/lib/auth-utils").then(m => m.encrypt(newSessionPayload));
        cookieStore.set("session", encryptedSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: "Error cambiando contraseña" };
    }
}