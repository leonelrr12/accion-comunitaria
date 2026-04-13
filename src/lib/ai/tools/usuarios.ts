import { z } from 'zod'
import { prisma } from '../prisma'
import { Tool } from '../types'

// Buscar usuario por nombre o email
export const buscarUsuario: Tool = {
  name: 'buscar_usuario',
  description: 'Buscar un usuario por nombre, apellido o email',
  parameters: z.object({
    query: z.string().describe('Nombre, apellido o email a buscar'),
  }),
  execute: async ({ query }) => {
    const results = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: 'insensitive' } },
          { lastName: { contains: query as string, mode: 'insensitive' } },
          { email: { contains: query as string, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        role: { select: { name: true } },
        community: { select: { name: true } },
        _count: { select: { persons: true } },
      },
    })

    // Tipos inferidos desde Prisma — sin `any`
    return results.map((u) => ({
      id: u.id,
      name: u.name,
      lastName: u.lastName,
      email: u.email,
      role: u.role.name,
      community: u.community?.name ?? null,
      afiliados: u._count.persons,
    }))
  },
}

// Listar usuarios con paginación
export const listarUsuarios: Tool = {
  name: 'listar_usuarios',
  description: 'Listar usuarios del sistema con paginación',
  parameters: z.object({
    limite: z.number().optional().default(10).describe('Cantidad máxima de resultados'),
    pagina: z.number().optional().default(1).describe('Número de página'),
    rol: z.string().optional().describe('Filtrar por nombre de rol'),
  }),
  execute: async (args) => {
    const limite = (args.limite as number | undefined) ?? 10
    const pagina = (args.pagina as number | undefined) ?? 1
    const skip = (pagina - 1) * limite

    const where = args.rol ? { role: { name: args.rol as string } } : {}

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limite,
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: { select: { name: true } },
          community: { select: { name: true } },
          _count: { select: { persons: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return {
      usuarios: usuarios.map((u) => ({
        id: u.id,
        name: u.name,
        lastName: u.lastName,
        email: u.email,
        role: u.role.name,
        community: u.community?.name ?? null,
        afiliados: u._count.persons,
        createdAt: u.createdAt,
      })),
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    }
  },
}

// Obtener detalles de un usuario por ID
export const usuarioPorId: Tool = {
  name: 'usuario_por_id',
  description: 'Obtener detalles completos de un usuario por su ID',
  parameters: z.object({
    id: z.number().describe('ID del usuario'),
  }),
  execute: async ({ id }) => {
    const usuario = await prisma.user.findUnique({
      where: { id: id as number },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        lastLogin: true,
        role: { select: { name: true, description: true } },
        community: { select: { name: true } },
        province: { select: { name: true } },
        district: { select: { name: true } },
        corregimiento: { select: { name: true } },
        _count: { select: { persons: true } },
      },
    })

    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    return {
      success: true,
      usuario: {
        id: usuario.id,
        name: usuario.name,
        lastName: usuario.lastName,
        email: usuario.email,
        phone: usuario.phone,
        role: usuario.role,
        community: usuario.community?.name ?? null,
        province: usuario.province?.name ?? null,
        district: usuario.district?.name ?? null,
        corregimiento: usuario.corregimiento?.name ?? null,
        afiliados: usuario._count.persons,
        createdAt: usuario.createdAt,
        lastLogin: usuario.lastLogin,
      },
    }
  },
}

// Estadísticas por usuario
// OPTIMIZADO: de 2 queries (groupBy + findMany) a 1 query con _count filtrado
export const estadisticasUsuario: Tool = {
  name: 'estadisticas_usuario',
  description: 'Obtener estadísticas detalladas de un usuario específico',
  parameters: z.object({
    usuario_id: z.number().describe('ID del usuario'),
  }),
  execute: async ({ usuario_id }) => {
    const usuario = await prisma.user.findUnique({
      where: { id: usuario_id as number },
      select: {
        id: true,
        name: true,
        lastName: true,
        role: { select: { name: true } },
        _count: { select: { persons: true } },
      },
    })

    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // Distribución geográfica: 1 query en lugar de groupBy + findMany
    const comunidades = await prisma.community.findMany({
      where: { persons: { some: { leaderUserId: usuario_id as number } } },
      select: {
        name: true,
        _count: {
          select: { persons: { where: { leaderUserId: usuario_id as number } } },
        },
      },
    })

    const distribucion = comunidades.map((c) => ({
      comunidad: c.name,
      cantidad: c._count.persons,
    }))

    return {
      usuario: {
        id: usuario.id,
        nombre: `${usuario.name} ${usuario.lastName}`,
        rol: usuario.role.name,
      },
      totalAfiliados: usuario._count.persons,
      distribucionPorComunidad: distribucion,
    }
  },
}

// Listar roles disponibles
export const listarRoles: Tool = {
  name: 'listar_roles',
  description: 'Obtener todos los roles disponibles en el sistema',
  parameters: z.object({}),
  execute: async () => {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    })

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      usuarios: r._count.users,
    }))
  },
}

export const usuariosTools = [
  buscarUsuario,
  listarUsuarios,
  usuarioPorId,
  estadisticasUsuario,
  listarRoles,
]