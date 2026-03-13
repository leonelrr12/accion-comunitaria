import { z } from 'zod'
import { prisma } from '../prisma'
import { Tool } from '../types'

// Total de personas registradas
export const totalPersonas: Tool = {
  name: 'total_personas',
  description: 'Obtener el total de personas registradas en el sistema',
  parameters: z.object({}),
  execute: async () => {
    const total = await prisma.person.count()
    return { total }
  },
}

// Personas por provincia
export const personasPorProvincia: Tool = {
  name: 'personas_por_provincia',
  description: 'Obtener cantidad de personas agrupadas por provincia',
  parameters: z.object({}),
  execute: async () => {
    const resultado = await prisma.person.groupBy({
      by: ['provinceId'],
      _count: { id: true },
    })

    const provincias = await prisma.province.findMany({
      where: { id: { in: resultado.map((r: { provinceId: number | null }) => r.provinceId).filter((id: number | null): id is number => id !== null) } },
    })

    return resultado.map((r: { provinceId: number | null; _count: { id: number } }) => ({
      provincia: provincias.find((p: { id: number }) => p.id === r.provinceId)?.name ?? 'Sin provincia',
      total: r._count.id,
    }))
  },
}

// Ranking de líderes
export const rankingLideres: Tool = {
  name: 'ranking_lideres',
  description: 'Obtener ranking de líderes por cantidad de afiliados',
  parameters: z.object({
    limite: z.number().optional().default(10).describe('Cantidad máxima de resultados'),
  }),
  execute: async (args) => {
    const limite = (args.limite as number | undefined) ?? 10
    const resultado = await prisma.user.findMany({
      take: limite,
      include: {
        role: { select: { name: true } },
        _count: { select: { persons: true } },
      },
      orderBy: {
        persons: { _count: 'desc' },
      },
    })

    return resultado.map((user: { id: number; name: string; lastName: string; role: { name: string }; _count: { persons: number } }) => ({
      id: user.id,
      nombre: `${user.name} ${user.lastName}`,
      rol: user.role.name,
      afiliados: user._count.persons,
    }))
  },
}

// Estadísticas generales
export const estadisticasGenerales: Tool = {
  name: 'estadisticas_generales',
  description: 'Obtener resumen general del sistema',
  parameters: z.object({}),
  execute: async () => {
    const [
      totalPersonas,
      totalUsuarios,
      totalProvincias,
      totalDistritos,
      totalCorregimientos,
      totalComunidades,
    ] = await Promise.all([
      prisma.person.count(),
      prisma.user.count(),
      prisma.province.count(),
      prisma.district.count(),
      prisma.corregimiento.count(),
      prisma.community.count(),
    ])

    return {
      personas: totalPersonas,
      usuarios: totalUsuarios,
      provincias: totalProvincias,
      distritos: totalDistritos,
      corregimientos: totalCorregimientos,
      comunidades: totalComunidades,
    }
  },
}

// Personas por distrito
export const personasPorDistrito: Tool = {
  name: 'personas_por_distrito',
  description: 'Obtener cantidad de personas en un distrito específico',
  parameters: z.object({
    distrito_id: z.number().describe('ID del distrito'),
  }),
  execute: async ({ distrito_id }) => {
    const count = await prisma.person.count({
      where: { districtId: distrito_id as number },
    })
    const distrito = await prisma.district.findUnique({
      where: { id: distrito_id as number },
      include: { province: true },
    })
    return {
      distrito: distrito?.name,
      provincia: distrito?.province.name,
      total: count,
    }
  },
}

export const estadisticasTools = [
  totalPersonas,
  personasPorProvincia,
  rankingLideres,
  estadisticasGenerales,
  personasPorDistrito,
]