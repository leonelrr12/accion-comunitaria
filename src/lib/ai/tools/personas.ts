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
    // Verificar si la cédula ya existe
    const existeCedula = await prisma.person.findUnique({
      where: { cedula: args.cedula as string },
    })
    if (existeCedula) {
      return { success: false, error: 'Ya existe una persona con esta cédula' }
    }

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

// Actualizar persona
export const actualizarPersona: Tool = {
  name: 'actualizar_persona',
  description: 'Actualizar datos de una persona existente',
  parameters: z.object({
    id: z.number().describe('ID de la persona a actualizar'),
    nombre: z.string().optional().describe('Nuevo nombre'),
    apellido: z.string().optional().describe('Nuevo apellido'),
    telefono: z.string().optional().describe('Nuevo teléfono'),
    email: z.string().optional().describe('Nuevo correo electrónico'),
    community_id: z.number().optional().describe('Nuevo ID de comunidad'),
    leader_user_id: z.number().optional().describe('Nuevo ID del líder asignado'),
  }),
  execute: async (args) => {
    const updateData: Record<string, unknown> = {}

    if (args.nombre) updateData.name = args.nombre
    if (args.apellido) updateData.lastName = args.apellido
    if (args.telefono) updateData.phone = args.telefono
    if (args.email) updateData.email = args.email
    if (args.community_id) updateData.communityId = args.community_id
    if (args.leader_user_id !== undefined) updateData.leaderUserId = args.leader_user_id

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No se proporcionaron datos para actualizar' }
    }

    try {
      const persona = await prisma.person.update({
        where: { id: args.id as number },
        data: updateData,
        include: {
          community: { select: { name: true } },
          leader: { select: { name: true, lastName: true } },
        },
      })
      return { success: true, persona }
    } catch {
      return { success: false, error: 'Persona no encontrada' }
    }
  },
}

// Eliminar persona
export const eliminarPersona: Tool = {
  name: 'eliminar_persona',
  description: 'Eliminar una persona del sistema',
  parameters: z.object({
    id: z.number().describe('ID de la persona a eliminar'),
  }),
  execute: async ({ id }) => {
    const persona = await prisma.person.findUnique({
      where: { id: id as number },
      select: { name: true, lastName: true, cedula: true },
    })

    if (!persona) {
      return { success: false, error: 'Persona no encontrada' }
    }

    await prisma.person.delete({
      where: { id: id as number },
    })

    return {
      success: true,
      message: `Persona ${persona.name} ${persona.lastName} (Cédula: ${persona.cedula}) eliminada correctamente`
    }
  },
}

// Asignar líder a persona
export const asignarLider: Tool = {
  name: 'asignar_lider',
  description: 'Asignar o cambiar el líder de una persona',
  parameters: z.object({
    persona_id: z.number().describe('ID de la persona'),
    lider_id: z.number().describe('ID del usuario líder'),
  }),
  execute: async ({ persona_id, lider_id }) => {
    // Verificar que la persona existe
    const persona = await prisma.person.findUnique({
      where: { id: persona_id as number },
    })

    if (!persona) {
      return { success: false, error: 'Persona no encontrada' }
    }

    // Verificar que el líder existe
    const lider = await prisma.user.findUnique({
      where: { id: lider_id as number },
      include: { role: { select: { name: true } } },
    })

    if (!lider) {
      return { success: false, error: 'Líder no encontrado' }
    }

    // Actualizar la persona
    const personaActualizada = await prisma.person.update({
      where: { id: persona_id as number },
      data: { leaderUserId: lider_id as number },
      include: {
        community: { select: { name: true } },
        leader: { select: { name: true, lastName: true } },
      },
    })

    return {
      success: true,
      message: `Se asignó a ${personaActualizada.name} ${personaActualizada.lastName} al líder ${lider.name} ${lider.lastName} (${lider.role.name})`,
      persona: personaActualizada,
    }
  },
}

// Buscar persona por ID exacto
export const buscarPersonaPorId: Tool = {
  name: 'buscar_persona_por_id',
  description: 'Obtener los detalles completos de una persona por su ID',
  parameters: z.object({
    id: z.number().describe('ID de la persona'),
  }),
  execute: async ({ id }) => {
    const persona = await prisma.person.findUnique({
      where: { id: id as number },
      include: {
        community: { select: { name: true } },
        leader: { select: { name: true, lastName: true } },
        province: { select: { name: true } },
        district: { select: { name: true } },
        corregimiento: { select: { name: true } },
      },
    })

    if (!persona) {
      return { success: false, error: 'Persona no encontrada' }
    }

    return { success: true, persona }
  },
}

export const personasTools = [
  buscarPersona,
  crearPersona,
  personasPorComunidad,
  afiliadosDeLider,
  listarPersonas,
  actualizarPersona,
  eliminarPersona,
  asignarLider,
  buscarPersonaPorId,
]