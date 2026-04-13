import { z } from 'zod'

// Definición de una tool — genérica para conservar inferencia de tipos en execute()
export interface Tool<T extends z.ZodRawShape = z.ZodRawShape> {
  name: string
  description: string
  parameters: z.ZodObject<T>
  execute: (args: z.infer<z.ZodObject<T>>) => Promise<unknown>
}

// Definición de tool para el modelo de Ollama — properties con tipos estrictos
export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, {
        type: 'string' | 'number' | 'boolean' | 'array' | 'object'
        description?: string
        enum?: string[]
        default?: unknown
      }>
      required: string[]
    }
  }
}

// Mensaje del chat
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Respuesta del agente
export interface AgentResponse {
  message: string
  toolCalls?: Array<{
    name: string
    args: Record<string, unknown>
    result: unknown
  }>
}