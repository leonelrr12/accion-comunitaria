import { User, Role, Person } from "@/types";

/**
 * Mapea un usuario de la base de datos (con sus relaciones) al formato seguro del cliente.
 * Se asegura de que no se exponga la contraseña y que los tipos sean consistentes.
 */
export function mapUserFromDB(dbUser: any): User {
    return {
        id: dbUser.id,
        role: dbUser.role?.name || "Desconocido",
        name: dbUser.name,
        lastName: dbUser.lastName,
        email: dbUser.email,
        phone: dbUser.phone,
        provinceId: dbUser.provinceId,
        districtId: dbUser.districtId,
        corregimientoId: dbUser.corregimientoId,
        communityId: dbUser.communityId,
        inviteCode: dbUser.inviteCode,
        createdBy: dbUser.createdBy,
        parentLeaderId: dbUser.leaders && dbUser.leaders.length > 0 ? String(dbUser.leaders[0].leaderId) : "",
        mustChangePassword: dbUser.mustChangePassword,
        lastLogin: dbUser.lastLogin ? (dbUser.lastLogin instanceof Date ? dbUser.lastLogin.toISOString() : dbUser.lastLogin) : null,
        createdAt: dbUser.createdAt instanceof Date ? dbUser.createdAt.toISOString() : dbUser.createdAt,
    };
}

/**
 * Mapea un rol de la base de datos al formato del cliente.
 */
export function mapRoleFromDB(dbRole: any): Role {
    return {
        id: dbRole.id,
        name: dbRole.name,
        description: dbRole.description,
        createdAt: dbRole.createdAt instanceof Date ? dbRole.createdAt.toISOString() : dbRole.createdAt,
    };
}

/**
 * Mapea un afiliado (persona) de la base de datos al formato del cliente.
 */
export function mapPersonFromDB(dbPerson: any): Person {
    return {
        id: dbPerson.id,
        name: dbPerson.name,
        lastName: dbPerson.lastName,
        cedula: dbPerson.cedula,
        phone: dbPerson.phone,
        email: dbPerson.email,
        provinceId: dbPerson.provinceId,
        districtId: dbPerson.districtId,
        corregimientoId: dbPerson.corregimientoId,
        communityId: dbPerson.communityId,
        leaderUserId: dbPerson.leaderUserId,
        createdAt: dbPerson.createdAt instanceof Date ? dbPerson.createdAt.toISOString() : dbPerson.createdAt,
    };
}
