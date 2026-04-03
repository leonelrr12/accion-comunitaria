import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// PATCH /api/users/[id] — update profile (name, lastName, phone)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    const clientIp = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`profile_update:${userId}:${clientIp}`, 60, 60 * 1000); // 60 requests per minute per user/ip combinations
    if (!rateLimit.allowed) {
        return NextResponse.json({ message: "Has excedido el límite de solicitudes. Intenta de nuevo más tarde." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, lastName, phone, provinceId, districtId, corregimientoId, communityId } = body;

    if (!name || !lastName) {
        return NextResponse.json({ message: "Nombre y apellido son requeridos" }, { status: 400 });
    }

    try {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                name: String(name).trim(),
                lastName: String(lastName).trim(),
                phone: phone ? String(phone).trim() : null,
                provinceId: provinceId ? Number(provinceId) : null,
                districtId: districtId ? Number(districtId) : null,
                corregimientoId: corregimientoId ? Number(corregimientoId) : null,
                communityId: communityId ? Number(communityId) : null,
            },
            select: { 
                id: true, 
                name: true, 
                lastName: true, 
                phone: true, 
                email: true,
                provinceId: true,
                districtId: true,
                corregimientoId: true,
                communityId: true
            },
        });
        return NextResponse.json(updated);
    } catch (err) {
        console.error("Error updating user profile:", err);
        return NextResponse.json({ message: "Error al actualizar el perfil" }, { status: 500 });
    }
}
