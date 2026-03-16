import { NextRequest, NextResponse } from 'next/server'
import { agent, createAgent } from '@/lib/ai/agent'
import { ChatMessage } from '@/lib/ai/types'
import { decrypt } from '@/lib/auth-utils'

interface SessionPayload {
  id: number
  email: string
  name: string
  lastName: string
  role: string
  mustChangePassword: boolean
}

/**
 * Verifica la sesión del usuario desde la cookie
 * @returns La sesión decodificada o null si no es válida
 */
async function verifySession(request: NextRequest): Promise<SessionPayload | null> {
  const sessionCookie = request.cookies.get('session')
  if (!sessionCookie) {
    return null
  }

  try {
    const session = await decrypt(sessionCookie.value) as SessionPayload | null
    return session
  } catch {
    return null
  }
}

/**
 * Verifica que el usuario sea administrador
 */
function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === 'ADMIN'
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await verifySession(request)
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      )
    }

    // Verificar autorización (solo ADMIN)
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de administrador.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar input
    const { messages, model } = body as {
      messages: ChatMessage[]
      model?: string
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Se requiere un array de mensajes' },
        { status: 400 }
      )
    }

    // Usar modelo especificado o default
    const activeAgent = model ? createAgent(model) : agent

    // Procesar con el agente
    const response = await activeAgent.chat(messages)

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error('Error en agent chat:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

// Endpoint para streaming
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const session = await verifySession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'No autorizado. Debe iniciar sesión.' },
      { status: 401 }
    )
  }

  // Verificar autorización (solo ADMIN)
  if (!isAdmin(session)) {
    return NextResponse.json(
      { error: 'Acceso denegado. Se requiere rol de administrador.' },
      { status: 403 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const message = searchParams.get('message')

  if (!message) {
    return NextResponse.json(
      { error: 'Se requiere el parámetro message' },
      { status: 400 }
    )
  }

  try {
    const encoder = new TextEncoder()
    const stream = agent.streamChat([{ role: 'user', content: message }])

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error en agent stream:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}