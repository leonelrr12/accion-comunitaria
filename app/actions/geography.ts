"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

// --- PROVINCES ---
export async function getProvinces() {
    return await prisma.province.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { districts: true } } }
    });
}

export async function createProvince(name: string) {
    await requireAdmin();
    const province = await prisma.province.create({ data: { name } });
    revalidatePath("/admin/dashboard/geografia");
    return province;
}

export async function deleteProvince(id: number) {
    await requireAdmin();
    await prisma.province.delete({ where: { id } });
    revalidatePath("/admin/dashboard/geografia");
}

// --- DISTRICTS ---
export async function getDistricts(provinceId?: number) {
    return await prisma.district.findMany({
        where: provinceId ? { provinceId } : {},
        orderBy: { name: 'asc' },
        include: { province: true, _count: { select: { corregimientos: true } } }
    });
}

export async function createDistrict(provinceId: number, name: string) {
    await requireAdmin();
    const district = await prisma.district.create({
        data: { name, provinceId }
    });
    revalidatePath("/admin/dashboard/geografia");
    return district;
}

// --- CORREGIMIENTOS ---
export async function getCorregimientos(districtId?: number) {
    return await prisma.corregimiento.findMany({
        where: districtId ? { districtId } : {},
        orderBy: { name: 'asc' },
        include: { district: { include: { province: true } }, _count: { select: { communities: true } } }
    });
}

export async function createCorregimiento(districtId: number, name: string) {
    await requireAdmin();
    const corregimiento = await prisma.corregimiento.create({
        data: { name, districtId }
    });
    revalidatePath("/admin/dashboard/geografia");
    return corregimiento;
}

// --- COMMUNITIES ---
export async function getCommunities(corregimientoId?: number) {
    return await prisma.community.findMany({
        where: corregimientoId ? { corregimientoId } : {},
        orderBy: { name: 'asc' },
        include: { corregimiento: { include: { district: { include: { province: true } } } } }
    });
}

export async function createCommunity(corregimientoId: number, name: string) {
    await requireAdmin();
    const community = await prisma.community.create({
        data: { name, corregimientoId }
    });
    revalidatePath("/admin/dashboard/geografia");
    return community;
}
