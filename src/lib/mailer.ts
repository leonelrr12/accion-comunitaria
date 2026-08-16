// Envío de correos vía mailer-api (producción, puerto 3004)
// Contrato: POST /api/send-email con Authorization: Bearer <key> y {to, subject, html, text}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const mailerUrl = process.env.MAILER_URL || 'http://localhost:3004'
  const apiKey = process.env.MAILER_API_KEY
  if (!apiKey) {
    throw new Error('MAILER_API_KEY no está definida en el entorno')
  }

  const res = await fetch(`${mailerUrl}/api/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ to, subject, html }),
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`Mailer rechazó el correo: ${res.status}`)
  }
  return res.json()
}
