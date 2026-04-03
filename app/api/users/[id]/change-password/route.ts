import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// POST /api/users/[id]/change-password
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    const clientIp = getClientIp(req.headers) || "unknown";
    const rateLimit = checkRateLimit(`pwd_change:${clientIp}`, 10, 60 * 60 * 1000); // 10 attempts per hour
    if (!rateLimit.allowed) {
        return NextResponse.json({ message: "Demasiados intentos. Bloqueado temporalmente." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ message: "Faltan campos requeridos" }, { status: 400 });
    }
    if (String(newPassword).length < 8) {
        return NextResponse.json({ message: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
        if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ message: "La contraseña actual es incorrecta" }, { status: 401 });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash, mustChangePassword: false },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error changing password:", err);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}
