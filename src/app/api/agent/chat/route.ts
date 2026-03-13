import { NextRequest, NextResponse } from 'next/server'
import { agent, createAgent } from '@/lib/ai/agent'
import { ChatMessage } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
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