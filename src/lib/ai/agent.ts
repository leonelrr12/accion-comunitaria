import ollama from 'ollama'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { Tool, ToolDefinition, ChatMessage, AgentResponse } from './types'
import { allTools } from './tools'

// Convertir tools a formato Ollama
function toolsToOllamaFormat(tools: Tool[]): ToolDefinition[] {
  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object' as const,
        properties: Object.entries(tool.parameters.shape).reduce((acc, [key, schema]) => {
          const jsonSchema = zodToJsonSchema(schema as any)
          acc[key] = {
            type: (jsonSchema as any).type || 'string',
            description: (jsonSchema as any).description,
          }
          return acc
        }, {} as Record<string, any>),
        required: Object.keys(tool.parameters.shape).filter(
          key => !(tool.parameters.shape[key] as any).isOptional
        ),
      },
    },
  }))
}

// Sistema prompt para el agente
const SYSTEM_PROMPT = `Eres un asistente administrativo para el sistema de Acción Comunitaria de Panamá.
Tu función es ayudar a gestionar personas, líderes y comunidades.

Tienes acceso a las siguientes herramientas:

1. buscar_persona(query) - Buscar por nombre, apellido o cédula
2. buscar_persona_por_id(id) - Obtener detalles por ID
3. crear_persona(nombre, apellido, cedula, telefono?, email?) - Crear nueva persona
4. actualizar_persona(id, nombre?, apellido?, telefono?, email?, community_id?, leader_user_id?) - Actualizar datos
5. eliminar_persona(id) - Eliminar persona por ID
6. asignar_lider(persona_id, lider_id) - Asignar líder a persona
7. listar_personas(limite?, pagina?) - Listar personas paginadas

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

export class Agent {
  private model: string
  private tools: Tool[]
  private toolDefinitions: ToolDefinition[]

  //qwen2.5:1.5b
  //'qwen2.5'
  constructor(model: string = 'qwen2.5', tools: Tool[] = allTools) {
    this.model = model
    this.tools = tools
    this.toolDefinitions = toolsToOllamaFormat(tools)
  }

  // Procesar mensaje del usuario
  async chat(
    messages: ChatMessage[],
    onToolCall?: (name: string, args: Record<string, unknown>) => void
  ): Promise<AgentResponse> {
    const response = await ollama.chat({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      tools: this.toolDefinitions,
    })

    const message = response.message

    // Si el modelo quiere usar una tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCallsResults = []

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = toolCall.function.arguments as Record<string, unknown>

        // Buscar la tool correspondiente
        const tool = this.tools.find(t => t.name === toolName)
        if (!tool) {
          continue
        }

        // Validar argumentos con Zod
        const parsedArgs = tool.parameters.safeParse(toolArgs)
        if (!parsedArgs.success) {
          continue
        }

        // Notificar si hay callback
        onToolCall?.(toolName, toolArgs)

        // Ejecutar la tool
        const result = await tool.execute(toolArgs)
        toolCallsResults.push({
          name: toolName,
          args: toolArgs,
          result,
        })
      }

      // Construir respuesta con resultados de tools
      let responseMessage = message.content || ''

      if (toolCallsResults.length > 0) {
        // Formatear resultados para mostrar al usuario
        responseMessage += '\n\n' + this.formatToolResults(toolCallsResults)
      }

      return {
        message: responseMessage,
        toolCalls: toolCallsResults,
      }
    }

    return {
      message: message.content,
    }
  }

  // Formatear resultados de tools para mostrar
  private formatToolResults(results: Array<{ name: string; args: Record<string, unknown>; result: unknown }>): string {
    const lines: string[] = []

    for (const { name, result } of results) {
      console.log(result)
      switch (name) {
        // === PERSONAS ===
        case 'buscar_persona':
          const personas = result as any[]
          if (personas.length === 0) {
            lines.push('❌ No se encontraron personas.')
          } else {
            lines.push(`✅ Se encontraron ${personas.length} persona(s):`)
            personas.forEach((p: any) => {
              const comunidad = p.community?.name ? ` - ${p.community.name}` : ''
              const lider = p.leader ? ` (Líder: ${p.leader.name} ${p.leader.lastName})` : ''
              lines.push(`• ${p.name} ${p.lastName} (ID: ${p.id}, Cédula: ${p.cedula})${comunidad}${lider}`)
            })
          }
          break

        case 'buscar_persona_por_id':
          const personaDetallada = result as { success: boolean; persona?: any; error?: string }
          if (!personaDetallada.success) {
            lines.push(`❌ ${personaDetallada.error}`)
          } else {
            const p = personaDetallada.persona
            lines.push(`📋 Detalles de la persona:`)
            lines.push(`• Nombre: ${p.name} ${p.lastName}`)
            lines.push(`• Cédula: ${p.cedula}`)
            if (p.phone) lines.push(`• Teléfono: ${p.phone}`)
            if (p.email) lines.push(`• Email: ${p.email}`)
            if (p.province) lines.push(`• Provincia: ${p.province.name}`)
            if (p.district) lines.push(`• Distrito: ${p.district.name}`)
            if (p.corregimiento) lines.push(`• Corregimiento: ${p.corregimiento.name}`)
            if (p.community) lines.push(`• Comunidad: ${p.community.name}`)
            if (p.leader) lines.push(`• Líder: ${p.leader.name} ${p.leader.lastName}`)
          }
          break

        case 'crear_persona':
          const created = result as { success: boolean; id?: number; error?: string }
          if (created.success) {
            lines.push(`✅ Persona creada exitosamente con ID: ${created.id}`)
          } else {
            lines.push(`❌ Error: ${created.error}`)
          }
          break

        case 'actualizar_persona':
          const updated = result as { success: boolean; persona?: any; error?: string }
          if (!updated.success) {
            lines.push(`❌ ${updated.error}`)
          } else {
            lines.push(`✅ Persona actualizada correctamente`)
            lines.push(`• ${updated.persona.name} ${updated.persona.lastName} (ID: ${updated.persona.id})`)
          }
          break

        case 'eliminar_persona':
          const deleted = result as { success: boolean; message?: string; error?: string }
          if (deleted.success) {
            lines.push(`✅ ${deleted.message}`)
          } else {
            lines.push(`❌ ${deleted.error}`)
          }
          break

        case 'asignar_lider':
          const assigned = result as { success: boolean; message?: string; error?: string }
          if (assigned.success) {
            lines.push(`✅ ${assigned.message}`)
          } else {
            lines.push(`❌ ${assigned.error}`)
          }
          break

        case 'listar_personas':
          const listaPersonas = result as { personas: any[]; total: number; pagina: number; totalPaginas: number }
          lines.push(`📋 Lista de personas (Página ${listaPersonas.pagina} de ${listaPersonas.totalPaginas}, Total: ${listaPersonas.total}):`)
          listaPersonas.personas.forEach((p: any) => {
            const comunidad = p.community?.name ? ` - ${p.community.name}` : ''
            lines.push(`• [${p.id}] ${p.name} ${p.lastName} (${p.cedula})${comunidad}`)
          })
          break

        case 'personas_por_comunidad':
          const porComunidad = result as { comunidad: string; total: number }
          lines.push(`📊 Personas en ${porComunidad.comunidad || 'la comunidad'}: ${porComunidad.total}`)
          break

        case 'afiliados_de_lider':
          const afiliados = result as { lider: any; total: number; afiliados: any[] }
          lines.push(`👥 Afiliados de ${afiliados.lider.name} ${afiliados.lider.lastName}: ${afiliados.total} personas`)
          if (afiliados.afiliados.length > 0) {
            afiliados.afiliados.forEach((a: any) => {
              const comunidad = a.community?.name ? ` (${a.community.name})` : ''
              lines.push(`• ${a.name} ${a.lastName} - ${a.cedula}${comunidad}`)
            })
          }
          break

        // === USUARIOS ===
        case 'buscar_usuario':
          const usuarios = result as any[]
          if (usuarios.length === 0) {
            lines.push('❌ No se encontraron usuarios.')
          } else {
            lines.push(`✅ Se encontraron ${usuarios.length} usuario(s):`)
            usuarios.forEach((u: any) => {
              lines.push(`• [${u.id}] ${u.name} ${u.lastName} (${u.email}) - ${u.role} - ${u.afiliados} afiliados`)
            })
          }
          break

        case 'listar_usuarios':
          const listaUsuarios = result as { usuarios: any[]; total: number; pagina: number; totalPaginas: number }
          lines.push(`📋 Lista de usuarios (Página ${listaUsuarios.pagina} de ${listaUsuarios.totalPaginas}, Total: ${listaUsuarios.total}):`)
          listaUsuarios.usuarios.forEach((u: any) => {
            const comunidad = u.community ? ` - ${u.community}` : ''
            lines.push(`• [${u.id}] ${u.name} ${u.lastName} (${u.role}) - ${u.afiliados} afiliados${comunidad}`)
          })
          break

        case 'usuario_por_id':
          const usuarioDetallado = result as { success: boolean; usuario?: any; error?: string }
          if (!usuarioDetallado.success) {
            lines.push(`❌ ${usuarioDetallado.error}`)
          } else {
            const u = usuarioDetallado.usuario
            lines.push(`👤 Detalles del usuario:`)
            lines.push(`• Nombre: ${u.name} ${u.lastName}`)
            lines.push(`• Email: ${u.email}`)
            lines.push(`• Rol: ${u.role.name}`)
            if (u.phone) lines.push(`• Teléfono: ${u.phone}`)
            if (u.community) lines.push(`• Comunidad: ${u.community}`)
            lines.push(`• Afiliados: ${u.afiliados}`)
          }
          break

        case 'estadisticas_usuario':
          const statsUsuario = result as { usuario: any; totalAfiliados: number; distribucionPorComunidad: any[] }
          lines.push(`📊 Estadísticas de ${statsUsuario.usuario.nombre}:`)
          lines.push(`• Total afiliados: ${statsUsuario.totalAfiliados}`)
          if (statsUsuario.distribucionPorComunidad.length > 0) {
            lines.push(`• Distribución por comunidad:`)
            statsUsuario.distribucionPorComunidad.forEach((d: any) => {
              lines.push(`  - ${d.comunidad}: ${d.cantidad}`)
            })
          }
          break

        case 'listar_roles':
          const roles = result as any[]
          lines.push(`📋 Roles disponibles:`)
          roles.forEach((r: any) => {
            lines.push(`• [${r.id}] ${r.name} - ${r.usuarios} usuarios`)
          })
          break

        // === ESTADÍSTICAS ===
        case 'total_personas':
          const total = result as { total: number }
          lines.push(`📊 Total de personas registradas: ${total.total}`)
          break

        case 'estadisticas_generales':
          const stats = result as {
            personas: number
            usuarios: number
            provincias: number
            distritos: number
            corregimientos: number
            comunidades: number
          }
          lines.push('📊 Estadísticas del sistema:')
          lines.push(`• Personas: ${stats.personas}`)
          lines.push(`• Usuarios: ${stats.usuarios}`)
          lines.push(`• Provincias: ${stats.provincias}`)
          lines.push(`• Distritos: ${stats.distritos}`)
          lines.push(`• Corregimientos: ${stats.corregimientos}`)
          lines.push(`• Comunidades: ${stats.comunidades}`)
          break

        case 'ranking_lideres':
          const ranking = result as Array<{ id: number; nombre: string; rol: string; afiliados: number }>
          lines.push('🏆 Ranking de líderes:')
          ranking.forEach((l, i) => {
            lines.push(`${i + 1}. ${l.nombre} (${l.rol}): ${l.afiliados} afiliados`)
          })
          break

        case 'personas_por_provincia':
          const porProvincia = result as Array<{ provincia: string; total: number }>
          lines.push('📊 Personas por provincia:')
          porProvincia.forEach((p) => {
            lines.push(`• ${p.provincia}: ${p.total}`)
          })
          break

        case 'personas_por_distrito':
          const porDistrito = result as { distrito: string; provincia: string; total: number }
          lines.push(`📊 ${porDistrito.distrito} (${porDistrito.provincia}): ${porDistrito.total} personas`)
          break

        // === GEOGRAFÍA ===
        case 'listar_provincias':
          const provincias = result as Array<{ id: number; name: string }>
          lines.push('📋 Provincias:')
          provincias.forEach(p => lines.push(`• [${p.id}] ${p.name}`))
          break

        case 'listar_distritos':
          const distritos = result as Array<{ id: number; name: string; provincia: string }>
          lines.push('📋 Distritos:')
          distritos.forEach(d => lines.push(`• [${d.id}] ${d.name} (${d.provincia})`))
          break

        case 'listar_corregimientos':
          const corregimientos = result as Array<{ id: number; name: string; distrito: string; provincia: string }>
          lines.push('📋 Corregimientos:')
          corregimientos.forEach(c => lines.push(`• [${c.id}] ${c.name} (${c.distrito}, ${c.provincia})`))
          break

        case 'listar_comunidades':
          const comunidades = result as Array<{ id: number; name: string; corregimiento: string; distrito: string }>
          lines.push('📋 Comunidades:')
          comunidades.forEach(c => lines.push(`• [${c.id}] ${c.name} (${c.corregimiento}, ${c.distrito})`))
          break

        case 'buscar_ubicacion':
          const ubicaciones = result as { provincias: any[]; distritos: any[]; corregimientos: any[]; comunidades: any[] }
          const totalUbicaciones = ubicaciones.provincias.length + ubicaciones.distritos.length +
                                   ubicaciones.corregimientos.length + ubicaciones.comunidades.length
          lines.push(`🔍 Se encontraron ${totalUbicaciones} resultado(s):`)

          if (ubicaciones.provincias.length > 0) {
            lines.push('Provincias:')
            ubicaciones.provincias.forEach((p: any) => lines.push(`• [${p.id}] ${p.name}`))
          }
          if (ubicaciones.distritos.length > 0) {
            lines.push('Distritos:')
            ubicaciones.distritos.forEach((d: any) => lines.push(`• [${d.id}] ${d.name} (${d.provincia})`))
          }
          if (ubicaciones.corregimientos.length > 0) {
            lines.push('Corregimientos:')
            ubicaciones.corregimientos.forEach((c: any) => lines.push(`• [${c.id}] ${c.name} (${c.distrito}, ${c.provincia})`))
          }
          if (ubicaciones.comunidades.length > 0) {
            lines.push('Comunidades:')
            ubicaciones.comunidades.forEach((c: any) => lines.push(`• [${c.id}] ${c.name} (${c.corregimiento}, ${c.distrito})`))
          }
          break

        default:
          lines.push(`Resultados de ${name}: ${JSON.stringify(result, null, 2)}`)
      }
    }

    return lines.join('\n')
  }

  // Stream de respuesta (para chat en tiempo real)
  async *streamChat(
    messages: ChatMessage[]
  ): AsyncGenerator<string> {
    const stream = await ollama.chat({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      tools: this.toolDefinitions,
      stream: true,
    })

    for await (const chunk of stream) {
      if (chunk.message.content) {
        yield chunk.message.content
      }
    }
  }
}

// Instancia por defecto del agente
export const agent = new Agent()

// Función helper para crear instancias con modelo personalizado
export function createAgent(model: string): Agent {
  return new Agent(model)
}