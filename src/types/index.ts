// ─── Roles ───────────────────────────────────────────────────────────────────
export interface Role {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string;
}

// ─── User (cliente — nunca incluye passwordHash) ──────────────────────────────
export interface User {
    id: number;
    role: string;
    name: string;
    lastName: string;
    email: string;
    phone?: string | null;
    provinceId?: number | null;
    districtId?: number | null;
    corregimientoId?: number | null;
    communityId?: number | null;
    inviteCode?: string | null;
    createdBy?: number | null;
    parentLeaderId?: string | null;
    createdAt: string;
}

// ─── Afiliados ────────────────────────────────────────────────────────────────
export interface Person {
    id: number;
    name: string;
    lastName: string;
    cedula: string;
    phone?: string | null;
    email?: string | null;
    provinceId?: number | null;
    districtId?: number | null;
    corregimientoId?: number | null;
    communityId?: number | null;
    leaderUserId?: number | null;
    createdAt: string;
}

// ─── Geografía ────────────────────────────────────────────────────────────────
export interface GeographyItem {
    id: number;
    name: string;
}

// ─── Inputs de formularios ───────────────────────────────────────────────────
export interface CreateUserInput {
    name: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    role: string;
    parentLeaderId?: string;
    provinceId?: number | string | null;
    districtId?: number | string | null;
    corregimientoId?: number | string | null;
    communityId?: number | string | null;
    createdBy?: number;
}

export interface UpdateUserInput {
    name: string;
    lastName: string;
    email: string;
    phone?: string | null;
    role: string;
    parentLeaderId?: string | null;
}

export interface AffiliateInput {
    name: string;
    lastName: string;
    cedula: string;
    email?: string;
    phone?: string;
    leaderUserId?: string | number;
    provinceId?: string | number | null;
    districtId?: string | number | null;
    corregimientoId?: string | number | null;
    communityId?: string | number | null;
}

// ─── Respuesta estándar de Server Actions ────────────────────────────────────
export type ActionResult<T = undefined> =
    | { success: true; data?: T }
    | { success: false; error: string };