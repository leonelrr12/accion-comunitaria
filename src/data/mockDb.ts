export interface Role {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export interface User {
    id: string;
    role: string; // Dynamic role name
    name: string;
    lastName: string;
    email: string;
    password?: string;
    phone: string;
    provinceId?: string;
    districtId?: string;
    corregimientoId?: string;
    communityId?: string;
    inviteCode?: string;
    createdBy?: string;
    createdAt: string;
}

export const initialRoles: Role[] = [
    { id: "R1", name: "ADMIN", description: "Acceso total al sistema y gestión de usuarios", createdAt: new Date().toISOString() },
    { id: "R2", name: "Lider Regional", description: "Coordinador de toda una provincia o región", createdAt: new Date().toISOString() },
    { id: "R3", name: "Lider de Zona", description: "Responsable de un distrito o zona específica", createdAt: new Date().toISOString() },
    { id: "R4", name: "Comunitario", description: "Líder a nivel de corregimiento o comunidad", createdAt: new Date().toISOString() },
    { id: "R5", name: "Activista", description: "Miembro activo de apoyo en campo", createdAt: new Date().toISOString() },
];

export interface Person {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address: string;
    provinceId: string;
    districtId: string;
    corregimientoId: string;
    communityId: string;
    leaderId: string; // Links back to User.id
    createdAt: string;
}

// Initial mock leaders
export const initialUsers: User[] = [
    {
        id: "ADMIN1",
        role: "ADMIN",
        name: "Admin",
        lastName: "Sistema",
        email: "admin@example.com",
        password: "admin123",
        phone: "0000-0000",
        createdAt: new Date().toISOString(),
    },
    {
        id: "U1",
        role: "LEADER",
        name: "Carlos",
        lastName: "Pérez",
        email: "carlos@example.com",
        password: "leader",
        phone: "6000-0001",
        provinceId: "P1", // Panamá
        districtId: "D1", // Panamá
        corregimientoId: "C1", // San Francisco
        communityId: "COM1", // Punta Paitilla
        inviteCode: "CARLOS2026",
        createdAt: new Date().toISOString(),
    },
    {
        id: "U2",
        role: "LEADER",
        name: "Ana",
        lastName: "Gómez",
        email: "ana@example.com",
        password: "leader",
        phone: "6000-0002",
        provinceId: "P2", // Panamá Oeste
        districtId: "D4", // Arraiján
        corregimientoId: "C5", // Juan Demóstenes Arosemena
        communityId: "COM7", // Nuevo Arraiján
        inviteCode: "ANAGOMEZ",
        createdAt: new Date().toISOString(),
    },
];

// Initial mock affiliates
export const initialPersons: Person[] = [
    {
        id: "PER1",
        firstName: "Luis",
        lastName: "Martínez",
        phone: "6000-0003",
        address: "Calle 50, Edificio Global",
        provinceId: "P1",
        districtId: "D1",
        corregimientoId: "C1",
        communityId: "COM1",
        leaderId: "U1", // Invitado por Carlos
        createdAt: new Date().toISOString(),
    },
];
