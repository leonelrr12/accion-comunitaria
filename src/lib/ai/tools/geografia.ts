import { z } from 'zod'
import { prisma } from '../prisma'
import { Tool } from '../types'

// Listar provincias
export const listarProvincias: Tool = {
  name: 'listar_provincias',
  description: 'Obtener todas las provincias registradas',
  parameters: z.object({}),
  execute: async () => {
    return prisma.province.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
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
      select: {
        id: true,
        name: true,
        province: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    })

    return distritos.map((d) => ({
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
      select: {
        id: true,
        name: true,
        district: {
          select: {
            name: true,
            province: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return corregimientos.map((c) => ({
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
      select: {
        id: true,
        name: true,
        corregimiento: {
          select: {
            name: true,
            district: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return comunidades.map((c) => ({
      id: c.id,
      name: c.name,
      corregimiento: c.corregimiento.name,
      distrito: c.corregimiento.district.name,
    }))
  },
}

// Buscar ubicación completa
// OPTIMIZADO: reemplazado `include` con `select` en todas las sub-queries para evitar over-fetching
export const buscarUbicacion: Tool = {
  name: 'buscar_ubicacion',
  description: 'Buscar ubicación geográfica (provincia, distrito, corregimiento o comunidad) por nombre',
  parameters: z.object({
    query: z.string().describe('Nombre a buscar'),
  }),
  execute: async ({ query }) => {
    const q = query as string

    const [provincias, distritos, corregimientos, comunidades] = await Promise.all([
      prisma.province.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true },
        take: 5,
      }),
      prisma.district.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, province: { select: { name: true } } },
        take: 5,
      }),
      prisma.corregimiento.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: {
          id: true,
          name: true,
          district: { select: { name: true, province: { select: { name: true } } } },
        },
        take: 5,
      }),
      prisma.community.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: {
          id: true,
          name: true,
          corregimiento: {
            select: {
              name: true,
              district: { select: { name: true, province: { select: { name: true } } } },
            },
          },
        },
        take: 5,
      }),
    ])

    return {
      provincias,
      distritos: distritos.map((d) => ({
        id: d.id,
        name: d.name,
        provincia: d.province.name,
      })),
      corregimientos: corregimientos.map((c) => ({
        id: c.id,
        name: c.name,
        distrito: c.district.name,
        provincia: c.district.province.name,
      })),
      comunidades: comunidades.map((c) => ({
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