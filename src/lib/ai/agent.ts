import { z } from 'zod'
import { Tool, ToolDefinition, ChatMessage, AgentResponse } from './types'
import { allTools } from './tools'

// Logger condicional — activa con DEBUG_AGENT=true en variables de entorno
// Evita exponer datos sensibles (cédulas, emails, resultados de BD) en producción
const log = process.env.DEBUG_AGENT === 'true'
  ? (...args: unknown[]) => console.log(...args)
  : () => {}

// ─── Conversión de tools a formato OpenAI (compatible DeepSeek) ──────────────
//
// Compatible con Zod v4, donde las clases internas (ZodOptional, ZodDefault,
// etc.) ya no se exportan y _def.innerType no existe.
// En su lugar usamos schema._def.type (string discriminator) y
// schema._def.innerType fue reemplazado por schema._def.inner en v4.

type ZodDefAny = {
  type?: string
  typeName?: string       // Zod v3 fallback
  inner?: ZodDefAny       // Zod v4: innerType de Optional/Default
  innerType?: ZodDefAny   // Zod v3: innerType de Optional/Default
  description?: string
}

function unwrapDef(def: ZodDefAny): ZodDefAny {
  // Desenvolver optional/default/nullable para llegar al tipo base
  const typeName = def.type ?? def.typeName ?? ''
  if (typeName === 'optional' || typeName === 'ZodOptional' ||
      typeName === 'default'  || typeName === 'ZodDefault'  ||
      typeName === 'nullable' || typeName === 'ZodNullable') {
    const inner = def.inner ?? def.innerType
    if (inner) return unwrapDef(inner)
  }
  return def
}

type JsonPrimitiveType = 'string' | 'number' | 'boolean' | 'array' | 'object'

function zodTypeToJsonType(schema: z.ZodTypeAny): JsonPrimitiveType {
  const raw = (schema as unknown as { _def: ZodDefAny })._def
  const def = unwrapDef(raw)
  const typeName = (def.type ?? def.typeName ?? '').toLowerCase()

  if (typeName.includes('number')) return 'number'
  if (typeName.includes('boolean')) return 'boolean'
  if (typeName.includes('array')) return 'array'
  if (typeName.includes('object')) return 'object'
  return 'string'
}

function isOptionalSchema(schema: z.ZodTypeAny): boolean {
  const raw = (schema as unknown as { _def: ZodDefAny })._def
  const typeName = (raw.type ?? raw.typeName ?? '').toLowerCase()
  return typeName.includes('optional') || typeName.includes('default')
}

function extractDescription(schema: z.ZodTypeAny): string | undefined {
  const raw = (schema as unknown as { _def: ZodDefAny })._def
  // Descripción puede estar en el wrapper (optional/default) o en el tipo base
  return raw.description ?? unwrapDef(raw).description
}

function toolsToOpenAIFormat(tools: Tool[]): ToolDefinition[] {
  return tools.map(tool => {
    const shape = tool.parameters.shape as Record<string, z.ZodTypeAny>

    const properties = Object.entries(shape).reduce<Record<string, { type: JsonPrimitiveType; description?: string }>>((acc, [key, schema]) => {
      const description = extractDescription(schema)
      acc[key] = {
        type: zodTypeToJsonType(schema),
        ...(description ? { description } : {}),
      }
      return acc
    }, {})

    // Campo es requerido si NO es optional ni tiene default
    const required = Object.keys(shape).filter(key => !isOptionalSchema(shape[key]))

    return {
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object' as const,
          properties,
          required,
        },
      },
    }
  })
}

// ─── System prompt ────────────────────────────────────────────────────────────
//
// FIX: El prompt ahora se genera dinámicamente a partir de las tools registradas,
// por lo que siempre está sincronizado sin importar cuántas tools se agreguen.

const BASE_PROMPT = `Eres un asistente administrativo para el sistema de Acción Comunitaria de Panamá.
Tu función es ayudar a gestionar personas, líderes y comunidades.

REGLAS IMPORTANTES:
1. Siempre responde en español
2. Cuando el usuario pida actualizar/eliminar, USA LA TOOL INMEDIATAMENTE con los datos proporcionados
3. NO pidas información adicional si ya tienes los datos necesarios
4. Si el usuario menciona un ID, úsalo directamente

EJEMPLOS DE USO:
Usuario: "actualiza el teléfono de la persona con ID 5 a 8888-9999"
Acción: Llamar actualizar_persona(id=5, telefono="8888-9999")

Usuario: "elimina la persona con ID 10"
Acción: Llamar eliminar_persona(id=10)

Usuario: "asigna la persona con ID 3 al líder con ID 7"
Acción: Llamar asignar_lider(persona_id=3, lider_id=7)

Usuario: "busca personas con apellido González"
Acción: Llamar buscar_persona(query="González")

Contexto del sistema:
- Jerarquía geográfica: Provincia > Distrito > Corregimiento > Comunidad
- Las personas pueden tener un líder asignado
- Los usuarios pueden ser administradores o líderes`

function buildSystemPrompt(tools: Tool[]): string {
  const toolList = tools
    .map(t => `- ${t.name}: ${t.description}`)
    .join('\n')
  return `${BASE_PROMPT}\n\nHerramientas disponibles:\n${toolList}`
}

// ─── Formatters de resultados ─────────────────────────────────────────────────
//
// FIX: El switch gigante fue reemplazado por un mapa de funciones formatter.
// Cada tool tiene su formatter tipado. Agregar una tool nueva = agregar una
// entrada al mapa, sin tocar el resto de la clase.

type Formatter = (result: unknown) => string[]

const formatters: Record<string, Formatter> = {
  // === PERSONAS ===
  buscar_persona: (result) => {
    const personas = result as Array<{ id: number; name: string; lastName: string; cedula: string; community?: { name: string }; leader?: { name: string; lastName: string } }>
    if (personas.length === 0) return ['❌ No se encontraron personas.']
    const lines = [`✅ Se encontraron ${personas.length} persona(s):`]
    personas.forEach(p => {
      const comunidad = p.community?.name ? ` - ${p.community.name}` : ''
      const lider = p.leader ? ` (Líder: ${p.leader.name} ${p.leader.lastName})` : ''
      lines.push(`• ${p.name} ${p.lastName} (ID: ${p.id}, Cédula: ${p.cedula})${comunidad}${lider}`)
    })
    return lines
  },

  buscar_persona_por_id: (result) => {
    const r = result as { success: boolean; persona?: any; error?: string }
    if (!r.success) return [`❌ ${r.error}`]
    const p = r.persona
    const lines = ['📋 Detalles de la persona:',
      `• Nombre: ${p.name} ${p.lastName}`,
      `• Cédula: ${p.cedula}`,
    ]
    if (p.phone) lines.push(`• Teléfono: ${p.phone}`)
    if (p.email) lines.push(`• Email: ${p.email}`)
    if (p.province) lines.push(`• Provincia: ${p.province.name}`)
    if (p.district) lines.push(`• Distrito: ${p.district.name}`)
    if (p.corregimiento) lines.push(`• Corregimiento: ${p.corregimiento.name}`)
    if (p.community) lines.push(`• Comunidad: ${p.community.name}`)
    if (p.leader) lines.push(`• Líder: ${p.leader.name} ${p.leader.lastName}`)
    return lines
  },

  crear_persona: (result) => {
    const r = result as { success: boolean; id?: number; error?: string }
    return r.success
      ? [`✅ Persona creada exitosamente con ID: ${r.id}`]
      : [`❌ Error: ${r.error}`]
  },

  actualizar_persona: (result) => {
    const r = result as { success: boolean; persona?: any; error?: string }
    if (!r.success) return [`❌ ${r.error}`]
    return [
      '✅ Persona actualizada correctamente',
      `• ${r.persona.name} ${r.persona.lastName} (ID: ${r.persona.id})`,
    ]
  },

  eliminar_persona: (result) => {
    const r = result as { success: boolean; message?: string; error?: string }
    return r.success ? [`✅ ${r.message}`] : [`❌ ${r.error}`]
  },

  asignar_lider: (result) => {
    const r = result as { success: boolean; message?: string; error?: string }
    return r.success ? [`✅ ${r.message}`] : [`❌ ${r.error}`]
  },

  listar_personas: (result) => {
    const r = result as { personas: any[]; total: number; pagina: number; totalPaginas: number }
    const lines = [`📋 Lista de personas (Página ${r.pagina} de ${r.totalPaginas}, Total: ${r.total}):`]
    r.personas.forEach(p => {
      const comunidad = p.community?.name ? ` - ${p.community.name}` : ''
      lines.push(`• [${p.id}] ${p.name} ${p.lastName} (${p.cedula})${comunidad}`)
    })
    return lines
  },

  personas_por_comunidad: (result) => {
    const r = result as { comunidad: string; total: number }
    return [`📊 Personas en ${r.comunidad || 'la comunidad'}: ${r.total}`]
  },

  afiliados_de_lider: (result) => {
    const r = result as { lider: any; total: number; afiliados: any[] }
    const lines = [`👥 Afiliados de ${r.lider.name} ${r.lider.lastName}: ${r.total} personas`]
    r.afiliados.forEach(a => {
      const comunidad = a.community?.name ? ` (${a.community.name})` : ''
      lines.push(`• ${a.name} ${a.lastName} - ${a.cedula}${comunidad}`)
    })
    return lines
  },

  // === USUARIOS ===
  buscar_usuario: (result) => {
    const usuarios = result as any[]
    if (usuarios.length === 0) return ['❌ No se encontraron usuarios.']
    const lines = [`✅ Se encontraron ${usuarios.length} usuario(s):`]
    usuarios.forEach(u => {
      lines.push(`• [${u.id}] ${u.name} ${u.lastName} (${u.email}) - ${u.role} - ${u.afiliados} afiliados`)
    })
    return lines
  },

  listar_usuarios: (result) => {
    const r = result as { usuarios: any[]; total: number; pagina: number; totalPaginas: number }
    const lines = [`📋 Lista de usuarios (Página ${r.pagina} de ${r.totalPaginas}, Total: ${r.total}):`]
    r.usuarios.forEach(u => {
      const comunidad = u.community ? ` - ${u.community}` : ''
      lines.push(`• [${u.id}] ${u.name} ${u.lastName} (${u.role}) - ${u.afiliados} afiliados${comunidad}`)
    })
    return lines
  },

  usuario_por_id: (result) => {
    const r = result as { success: boolean; usuario?: any; error?: string }
    if (!r.success) return [`❌ ${r.error}`]
    const u = r.usuario
    const lines = ['👤 Detalles del usuario:',
      `• Nombre: ${u.name} ${u.lastName}`,
      `• Email: ${u.email}`,
      `• Rol: ${u.role.name}`,
    ]
    if (u.phone) lines.push(`• Teléfono: ${u.phone}`)
    if (u.community) lines.push(`• Comunidad: ${u.community}`)
    lines.push(`• Afiliados: ${u.afiliados}`)
    return lines
  },

  estadisticas_usuario: (result) => {
    const r = result as { usuario: any; totalAfiliados: number; distribucionPorComunidad: Array<{ comunidad: string; cantidad: number }> }
    const lines = [
      `📊 Estadísticas de ${r.usuario.nombre}:`,
      `• Total afiliados: ${r.totalAfiliados}`,
    ]
    if (r.distribucionPorComunidad.length > 0) {
      lines.push('• Distribución por comunidad:')
      r.distribucionPorComunidad.forEach(d => lines.push(`  - ${d.comunidad}: ${d.cantidad}`))
    }
    return lines
  },

  listar_roles: (result) => {
    const roles = result as Array<{ id: number; name: string; usuarios: number }>
    const lines = ['📋 Roles disponibles:']
    roles.forEach(r => lines.push(`• [${r.id}] ${r.name} - ${r.usuarios} usuarios`))
    return lines
  },

  // === ESTADÍSTICAS ===
  total_personas: (result) => {
    const r = result as { total: number }
    return [`📊 Total de personas registradas: ${r.total}`]
  },

  estadisticas_generales: (result) => {
    const r = result as { personas: number; usuarios: number; provincias: number; distritos: number; corregimientos: number; comunidades: number }
    return [
      '📊 Estadísticas del sistema:',
      `• Personas: ${r.personas}`,
      `• Usuarios: ${r.usuarios}`,
      `• Provincias: ${r.provincias}`,
      `• Distritos: ${r.distritos}`,
      `• Corregimientos: ${r.corregimientos}`,
      `• Comunidades: ${r.comunidades}`,
    ]
  },

  ranking_lideres: (result) => {
    const ranking = result as Array<{ id: number; nombre: string; rol: string; afiliados: number }>
    const lines = ['🏆 Ranking de líderes:']
    ranking.forEach((l, i) => lines.push(`${i + 1}. ${l.nombre} (${l.rol}): ${l.afiliados} afiliados`))
    return lines
  },

  personas_por_provincia: (result) => {
    const r = result as Array<{ provincia: string; total: number }>
    const lines = ['📊 Personas por provincia:']
    r.forEach(p => lines.push(`• ${p.provincia}: ${p.total}`))
    return lines
  },

  personas_por_distrito: (result) => {
    const r = result as { distrito: string; provincia: string; total: number }
    return [`📊 ${r.distrito} (${r.provincia}): ${r.total} personas`]
  },

  // === GEOGRAFÍA ===
  listar_provincias: (result) => {
    const r = result as Array<{ id: number; name: string }>
    const lines = ['📋 Provincias:']
    r.forEach(p => lines.push(`• [${p.id}] ${p.name}`))
    return lines
  },

  listar_distritos: (result) => {
    const r = result as Array<{ id: number; name: string; provincia: string }>
    const lines = ['📋 Distritos:']
    r.forEach(d => lines.push(`• [${d.id}] ${d.name} (${d.provincia})`))
    return lines
  },

  listar_corregimientos: (result) => {
    const r = result as Array<{ id: number; name: string; distrito: string; provincia: string }>
    const lines = ['📋 Corregimientos:']
    r.forEach(c => lines.push(`• [${c.id}] ${c.name} (${c.distrito}, ${c.provincia})`))
    return lines
  },

  listar_comunidades: (result) => {
    const r = result as Array<{ id: number; name: string; corregimiento: string; distrito: string }>
    const lines = ['📋 Comunidades:']
    r.forEach(c => lines.push(`• [${c.id}] ${c.name} (${c.corregimiento}, ${c.distrito})`))
    return lines
  },

  buscar_ubicacion: (result) => {
    const r = result as { provincias: any[]; distritos: any[]; corregimientos: any[]; comunidades: any[] }
    const totalUbicaciones = r.provincias.length + r.distritos.length + r.corregimientos.length + r.comunidades.length
    const lines = [`🔍 Se encontraron ${totalUbicaciones} resultado(s):`]
    if (r.provincias.length > 0) {
      lines.push('Provincias:')
      r.provincias.forEach(p => lines.push(`• [${p.id}] ${p.name}`))
    }
    if (r.distritos.length > 0) {
      lines.push('Distritos:')
      r.distritos.forEach(d => lines.push(`• [${d.id}] ${d.name} (${d.provincia})`))
    }
    if (r.corregimientos.length > 0) {
      lines.push('Corregimientos:')
      r.corregimientos.forEach(c => lines.push(`• [${c.id}] ${c.name} (${c.distrito}, ${c.provincia})`))
    }
    if (r.comunidades.length > 0) {
      lines.push('Comunidades:')
      r.comunidades.forEach(c => lines.push(`• [${c.id}] ${c.name} (${c.corregimiento}, ${c.distrito})`))
    }
    return lines
  },
}

// Formatter por defecto para tools sin formatter registrado
function defaultFormatter(name: string, result: unknown): string[] {
  return [`📋 Resultado de ${name}:\n${JSON.stringify(result, null, 2)}`]
}

// ─── Cliente API DeepSeek (formato compatible OpenAI) ─────────────────────────

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const DEEPSEEK_TIMEOUT_MS = 120_000

function deepSeekHeaders(): Record<string, string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY no está definida en el entorno')
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }
}

// DeepSeek (OpenAI) devuelve tool_calls con arguments como string JSON.
// En streaming los argumentos llegan fragmentados y hay que acumularlos.
function normalizeToolCalls(
  toolCalls: Array<{ function: { name: string; arguments: string | Record<string, unknown> } }>
): Array<{ function: { name: string; arguments: Record<string, unknown> } }> {
  return toolCalls.map(tc => {
    let args: Record<string, unknown> = {}
    if (typeof tc.function.arguments === 'string') {
      try {
        args = JSON.parse(tc.function.arguments) as Record<string, unknown>
      } catch {
        args = {}
      }
    } else if (tc.function.arguments && typeof tc.function.arguments === 'object') {
      args = tc.function.arguments as Record<string, unknown>
    }
    return { function: { name: tc.function.name, arguments: args } }
  })
}

// Parser SSE para el streaming de DeepSeek (líneas "data: {...}" hasta "[DONE]")
async function* deepSeekStream(body: ReadableStream<Uint8Array>): AsyncGenerator<any> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return
        try {
          yield JSON.parse(data)
        } catch {
          // Ignorar chunks no JSON (pings, etc.)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// ─── Clase Agent ──────────────────────────────────────────────────────────────

export class Agent {
  private model: string
  private tools: Tool[]
  private toolDefinitions: ToolDefinition[]
  private systemPrompt: string

  // deepseek-chat → modelo por defecto de la API de DeepSeek (configurable)
  constructor(model: string = process.env.DEEPSEEK_MODEL || 'deepseek-chat', tools: Tool[] = allTools) {
    this.model = model
    this.tools = tools
    this.toolDefinitions = toolsToOpenAIFormat(tools)
    // FIX: system prompt generado dinámicamente desde las tools registradas
    this.systemPrompt = buildSystemPrompt(tools)
  }

  // ── Ejecutar una lista de tool calls y devolver los resultados ──────────────
  //
  // Extraído como método privado para reutilizarlo en chat() y streamChat().
  //
  // FIXES aplicados aquí:
  //   1. tool.execute() recibe parsedArgs.data (validado por Zod), no toolArgs (raw del modelo)
  //   2. try/catch por tool — un error en la BD no tumba el resto de tool calls
  //   3. onToolCall recibe los args validados, no los raw

  private async executeToolCalls(
    toolCalls: Array<{ function: { name: string; arguments: Record<string, unknown> } }>,
    onToolCall?: (name: string, args: Record<string, unknown>) => void
  ): Promise<Array<{ name: string; args: Record<string, unknown>; result: unknown }>> {
    const results = []

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name
      const toolArgs = toolCall.function.arguments as Record<string, unknown>

      const tool = this.tools.find(t => t.name === toolName)
      if (!tool) {
        log(`[Agent] Tool no encontrada: ${toolName}`)
        continue
      }

      // Preprocesar: convertir strings numéricos a números
      const processedArgs: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(toolArgs)) {
        processedArgs[key] = typeof value === 'string' && /^\d+$/.test(value)
          ? parseInt(value, 10)
          : value
      }

      // Validar con Zod
      const parsedArgs = tool.parameters.safeParse(processedArgs)
      if (!parsedArgs.success) {
        log(`[Agent] Error de validación en ${toolName}:`, parsedArgs.error.flatten())
        results.push({
          name: toolName,
          args: processedArgs,
          result: { success: false, error: `Argumentos inválidos: ${parsedArgs.error.message}` },
        })
        continue
      }

      // Notificar callback con args validados
      onToolCall?.(toolName, parsedArgs.data)

      // FIX: ejecutar con parsedArgs.data (no con toolArgs raw)
      // FIX: try/catch para aislar errores por tool
      let result: unknown
      try {
        result = await tool.execute(parsedArgs.data)
        log(`[Agent] ${toolName} →`, result)
      } catch (err) {
        console.error(`[Agent] Error ejecutando tool ${toolName}:`, err)
        result = { success: false, error: 'Error interno al ejecutar la operación' }
      }

      results.push({ name: toolName, args: parsedArgs.data, result })
    }

    return results
  }

  // ── Formatear resultados de tools ──────────────────────────────────────────

  private formatToolResults(
    results: Array<{ name: string; args: Record<string, unknown>; result: unknown }>
  ): string {
    return results
      .flatMap(({ name, result }) => {
        const formatter = formatters[name]
        return formatter ? formatter(result) : defaultFormatter(name, result)
      })
      .join('\n')
  }

  // ── chat() — respuesta completa (sin stream) ────────────────────────────────

  async chat(
    messages: ChatMessage[],
    onToolCall?: (name: string, args: Record<string, unknown>) => void
  ): Promise<AgentResponse> {
    log('[Agent] Iniciando chat. Modelo:', this.model, '| Tools:', this.toolDefinitions.length)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS)

    let response: any
    try {
      const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: deepSeekHeaders(),
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            ...messages,
          ],
          tools: this.toolDefinitions,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`DeepSeek API error ${res.status}: ${errText}`)
      }

      response = await res.json()
    } finally {
      clearTimeout(timeout)
    }

    log('[Agent] Respuesta de DeepSeek recibida')

    const message = response.choices?.[0]?.message
    if (!message) {
      throw new Error('Respuesta inesperada de DeepSeek (sin message)')
    }

    if (message.tool_calls && message.tool_calls.length > 0) {
      log(`[Agent] Tool calls detectados: ${message.tool_calls.length}`)

      const toolCallsResults = await this.executeToolCalls(
        normalizeToolCalls(message.tool_calls),
        onToolCall
      )

      const responseMessage = [
        message.content || '',
        toolCallsResults.length > 0 ? this.formatToolResults(toolCallsResults) : '',
      ].filter(Boolean).join('\n\n')

      return { message: responseMessage, toolCalls: toolCallsResults }
    }

    return { message: message.content ?? '' }
  }

  // ── streamChat() — respuesta en tiempo real ────────────────────────────────
  //
  // FIX: Ahora maneja tool calls correctamente.
  // DeepSeek entrega los tool calls fragmentados por chunks (uno por índice),
  // y se ejecutan cuando finish_reason = "tool_calls". El resultado se emite
  // como yield al final del stream.

  async *streamChat(
    messages: ChatMessage[],
    onToolCall?: (name: string, args: Record<string, unknown>) => void
  ): AsyncGenerator<string> {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: deepSeekHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages,
        ],
        tools: this.toolDefinitions,
        stream: true,
      }),
    })

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '')
      throw new Error(`DeepSeek API error ${res.status}: ${errText}`)
    }

    // Acumular tool calls por índice (name y arguments llegan en fragmentos)
    const toolCalls: Record<number, { name: string; args: string }> = {}

    for await (const chunk of deepSeekStream(res.body)) {
      const choice = chunk.choices?.[0]
      const delta = choice?.delta

      // Emitir texto de respuesta a medida que llega
      if (delta?.content) {
        yield delta.content
      }

      // Acumular fragmentos de tool calls
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const index = tc.index ?? 0
          toolCalls[index] ??= { name: '', args: '' }
          if (tc.function?.name) toolCalls[index].name += tc.function.name
          if (tc.function?.arguments) toolCalls[index].args += tc.function.arguments
        }
      }

      // Al terminar el turno con tool calls, ejecutarlos y devolver resultados
      if (choice?.finish_reason === 'tool_calls' && Object.keys(toolCalls).length > 0) {
        log(`[Agent] Stream: tool calls detectados: ${Object.keys(toolCalls).length}`)

        const completedCalls = Object.values(toolCalls).map(tc => ({
          function: { name: tc.name, arguments: tc.args },
        }))

        const toolCallsResults = await this.executeToolCalls(
          normalizeToolCalls(completedCalls),
          onToolCall
        )

        if (toolCallsResults.length > 0) {
          yield '\n\n' + this.formatToolResults(toolCallsResults)
        }
      }
    }
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

// Instancia por defecto del agente
export const agent = new Agent()

// Helper para crear instancias con modelo personalizado
export function createAgent(model: string, tools?: Tool[]): Agent {
  return new Agent(model, tools)
}