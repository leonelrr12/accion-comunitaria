import { z } from 'zod'
import { prisma } from '../prisma'
import { Tool } from '../types'

// Listar provincias
export const listarProvincias: Tool = {
  name: 'listar_provincias',
  description: 'Obtener todas las provincias registradas',
  parameters: z.object({}),
  execute: async () => {
    const provincias = await prisma.province.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
    return provincias
  },
}

// Listar distritos por provincia
export const listarDistritos: Tool = {
  name: 'listar_distritos',
  description: 'Obtener distritos de una provincia específica',
  parameters: z.object({
    provincia_id: z.number().optional().describe('ID de la provincia (opcional, si no se especifica lista todos)'),
  }),
  execute: async ({ provincia_id }) => {
    const where = provincia_id ? { provinceId: provincia_id as number } : {}
    const distritos = await prisma.district.findMany({
      where,
      include: { province: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })
    return distritos.map((d: { id: number; name: string; province: { name: string } }) => ({
      id: d.id,
      name: d.name,
      provincia: d.province.name,
    }))
  },
}

// Listar corregimientos por distrito
export const listarCorregimientos: Tool = {
  name: 'listar_corregimientos',
  description: 'Obtener corregimientos de un distrito específico',
  parameters: z.object({
    distrito_id: z.number().optional().describe('ID del distrito (opcional)'),
  }),
  execute: async ({ distrito_id }) => {
    const where = distrito_id ? { districtId: distrito_id as number } : {}
    const corregimientos = await prisma.corregimiento.findMany({
      where,
      include: {
        district: { select: { name: true, province: { select: { name: true } } } },
      },
      orderBy: { name: 'asc' },
    })
    return corregimientos.map((c: { id: number; name: string; district: { name: string; province: { name: string } } }) => ({
      id: c.id,
      name: c.name,
      distrito: c.district.name,
      provincia: c.district.province.name,
    }))
  },
}

// Listar comunidades por corregimiento
export const listarComunidades: Tool = {
  name: 'listar_comunidades',
  description: 'Obtener comunidades de un corregimiento específico',
  parameters: z.object({
    corregimiento_id: z.number().optional().describe('ID del corregimiento (opcional)'),
  }),
  execute: async ({ corregimiento_id }) => {
    const where = corregimiento_id ? { corregimientoId: corregimiento_id as number } : {}
    const comunidades = await prisma.community.findMany({
      where,
      include: {
        corregimiento: {
          select: {
            name: true,
            district: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
    return comunidades.map((c: { id: number; name: string; corregimiento: { name: string; district: { name: string } } }) => ({
      id: c.id,
      name: c.name,
      corregimiento: c.corregimiento.name,
      distrito: c.corregimiento.district.name,
    }))
  },
}

// Buscar ubicación completa
export const buscarUbicacion: Tool = {
  name: 'buscar_ubicacion',
  description: 'Buscar ubicación geográfica (provincia, distrito, corregimiento o comunidad) por nombre',
  parameters: z.object({
    query: z.string().describe('Nombre a buscar'),
  }),
  execute: async ({ query }) => {
    const [provincias, distritos, corregimientos, comunidades] = await Promise.all([
      prisma.province.findMany({
        where: { name: { contains: query as string, mode: 'insensitive' } },
        take: 5,
      }),
      prisma.district.findMany({
        where: { name: { contains: query as string, mode: 'insensitive' } },
        take: 5,
        include: { province: true },
      }),
      prisma.corregimiento.findMany({
        where: { name: { contains: query as string, mode: 'insensitive' } },
        take: 5,
        include: { district: { include: { province: true } } },
      }),
      prisma.community.findMany({
        where: { name: { contains: query as string, mode: 'insensitive' } },
        take: 5,
        include: { corregimiento: { include: { district: { include: { province: true } } } } },
      }),
    ])

    return {
      provincias: provincias.map((p: { id: number; name: string }) => ({ id: p.id, name: p.name })),
      distritos: distritos.map((d: { id: number; name: string; province: { name: string } }) => ({
        id: d.id,
        name: d.name,
        provincia: d.province.name,
      })),
      corregimientos: corregimientos.map((c: { id: number; name: string; district: { name: string; province: { name: string } } }) => ({
        id: c.id,
        name: c.name,
        distrito: c.district.name,
        provincia: c.district.province.name,
      })),
      comunidades: comunidades.map((c: { id: number; name: string; corregimiento: { name: string; district: { name: string; province: { name: string } } } }) => ({
        id: c.id,
        name: c.name,
        corregimiento: c.corregimiento.name,
        distrito: c.corregimiento.district.name,
        provincia: c.corregimiento.district.province.name,
      })),
    }
  },
}

export const geografiaTools = [
  listarProvincias,
  listarDistritos,
  listarCorregimientos,
  listarComunidades,
  buscarUbicacion,
]