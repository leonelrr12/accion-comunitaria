import { User } from "@/types";

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
        createdAt: dbUser.createdAt instanceof Date ? dbUser.createdAt.toISOString() : dbUser.createdAt,
    };
}
