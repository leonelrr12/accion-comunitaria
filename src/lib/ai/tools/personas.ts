import { z } from 'zod'
import { prisma } from '../prisma'
import { Tool } from '../types'

// Buscar persona por nombre o cédula
export const buscarPersona: Tool = {
  name: 'buscar_persona',
  description: 'Buscar una persona por nombre, apellido o cédula',
  parameters: z.object({
    query: z.string().describe('Nombre, apellido o cédula a buscar'),
  }),
  execute: async ({ query }) => {
    const results = await prisma.person.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: 'insensitive' } },
          { lastName: { contains: query as string, mode: 'insensitive' } },
          { cedula: { contains: query as string } },
        ],
      },
      take: 10,
      include: {
        community: { select: { name: true } },
        leader: { select: { name: true, lastName: true } },
      },
    })
    return results
  },
}

// Crear persona
export const crearPersona: Tool = {
  name: 'crear_persona',
  description: 'Registrar una nueva persona en el sistema',
  parameters: z.object({
    nombre: z.string().describe('Nombre de la persona'),
    apellido: z.string().describe('Apellido de la persona'),
    cedula: z.string().describe('Número de cédula'),
    telefono: z.string().optional().describe('Número de teléfono'),
    email: z.string().optional().describe('Correo electrónico'),
    community_id: z.number().optional().describe('ID de la comunidad'),
    leader_user_id: z.number().optional().describe('ID del líder asignado'),
  }),
  execute: async (args) => {
    const persona = await prisma.person.create({
      data: {
        name: args.nombre as string,
        lastName: args.apellido as string,
        cedula: args.cedula as string,
        phone: args.telefono as string | undefined,
        email: args.email as string | undefined,
        communityId: args.community_id as number | undefined,
        leaderUserId: args.leader_user_id as number | undefined,
      },
    })
    return { success: true, id: persona.id }
  },
}

// Personas por comunidad
export const personasPorComunidad: Tool = {
  name: 'personas_por_comunidad',
  description: 'Obtener la cantidad de personas en una comunidad específica',
  parameters: z.object({
    comunidad_id: z.number().describe('ID de la comunidad'),
  }),
  execute: async ({ comunidad_id }) => {
    const count = await prisma.person.count({
      where: { communityId: comunidad_id as number },
    })
    const comunidad = await prisma.community.findUnique({
      where: { id: comunidad_id as number },
      select: { name: true },
    })
    return { comunidad: comunidad?.name, total: count }
  },
}

// Afiliados de un líder
export const afiliadosDeLider: Tool = {
  name: 'afiliados_de_lider',
  description: 'Obtener los afiliados de un líder específico',
  parameters: z.object({
    lider_id: z.number().describe('ID del usuario líder'),
  }),
  execute: async ({ lider_id }) => {
    const lider = await prisma.user.findUnique({
      where: { id: lider_id as number },
      select: { name: true, lastName: true },
    })
    const afiliados = await prisma.person.findMany({
      where: { leaderUserId: lider_id as number },
      select: {
        id: true,
        name: true,
        lastName: true,
        cedula: true,
        phone: true,
        community: { select: { name: true } },
      },
    })
    return { lider, total: afiliados.length, afiliados }
  },
}

// Listar todas las personas (paginado)
export const listarPersonas: Tool = {
  name: 'listar_personas',
  description: 'Listar personas registradas con paginación',
  parameters: z.object({
    limite: z.number().optional().default(10).describe('Cantidad máxima de resultados'),
    pagina: z.number().optional().default(1).describe('Número de página'),
  }),
  execute: async (args) => {
    const limite = (args.limite as number | undefined) ?? 10
    const pagina = (args.pagina as number | undefined) ?? 1
    const skip = (pagina - 1) * limite
    const [personas, total] = await Promise.all([
      prisma.person.findMany({
        skip,
        take: limite,
        include: {
          community: { select: { name: true } },
          leader: { select: { name: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.person.count(),
    ])
    return { personas, total, pagina, totalPaginas: Math.ceil(total / limite) }
  },
}

export const personasTools = [
  buscarPersona,
  crearPersona,
  personasPorComunidad,
  afiliadosDeLider,
  listarPersonas,
]