export interface Role {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string;
}

export interface User {
    id: number;
    role: string; // The role name from the relation
    name: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string | null;
    provinceId?: number | null;
    districtId?: number | null;
    corregimientoId?: number | null;
    communityId?: number | null;
    inviteCode?: string | null;
    createdBy?: number | null;
    createdAt: string;
}

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

export interface GeographyItem {
    id: number;
    name: string;
}
