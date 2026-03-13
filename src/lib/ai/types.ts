import { z } from 'zod'

// Definición de una tool
export interface Tool {
  name: string
  description: string
  parameters: z.ZodObject<any>
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

// Definición de tool para el modelo de Ollama
export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, {
        type: string
        description?: string
        enum?: string[]
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