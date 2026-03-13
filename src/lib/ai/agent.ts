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

Tienes acceso a las siguientes capacidades:
- Gestión de personas: buscar, crear, listar personas
- Geografía: consultar provincias, distritos, corregimientos y comunidades
- Estadísticas: totales, rankings y resúmenes del sistema

Reglas importantes:
1. Siempre responde en español
2. Sé preciso con los datos que proporcionas
3. Antes de crear una persona, verifica que no exista
4. Para operaciones sensibles, confirma con el usuario
5. Usa las tools disponibles cuando necesites consultar o crear datos

Contexto del sistema:
- Jerarquía geográfica: Provincia > Distrito > Corregimiento > Comunidad
- Las personas pueden tener un líder asignado
- Los usuarios pueden ser administradores o líderes`

export class Agent {
  private model: string
  private tools: Tool[]
  private toolDefinitions: ToolDefinition[]

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
      switch (name) {
        case 'buscar_persona':
          const personas = result as any[]
          if (personas.length === 0) {
            lines.push('No se encontraron personas.')
          } else {
            lines.push(`Se encontraron ${personas.length} persona(s):`)
            personas.forEach((p: any) => {
              lines.push(`- ${p.name} ${p.lastName} (Cédula: ${p.cedula})`)
            })
          }
          break

        case 'crear_persona':
          const created = result as { success: boolean; id: number }
          if (created.success) {
            lines.push(`Persona creada exitosamente con ID: ${created.id}`)
          }
          break

        case 'total_personas':
          const total = result as { total: number }
          lines.push(`Total de personas registradas: ${total.total}`)
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
          lines.push(`- Personas: ${stats.personas}`)
          lines.push(`- Usuarios: ${stats.usuarios}`)
          lines.push(`- Provincias: ${stats.provincias}`)
          lines.push(`- Distritos: ${stats.distritos}`)
          lines.push(`- Corregimientos: ${stats.corregimientos}`)
          lines.push(`- Comunidades: ${stats.comunidades}`)
          break

        case 'ranking_lideres':
          const ranking = result as Array<{ id: number; nombre: string; rol: string; afiliados: number }>
          lines.push('🏆 Ranking de líderes:')
          ranking.forEach((l, i) => {
            lines.push(`${i + 1}. ${l.nombre} (${l.rol}): ${l.afiliados} afiliados`)
          })
          break

        case 'listar_provincias':
          const provincias = result as Array<{ id: number; name: string }>
          lines.push('📋 Provincias:')
          provincias.forEach(p => lines.push(`- ${p.id}: ${p.name}`))
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