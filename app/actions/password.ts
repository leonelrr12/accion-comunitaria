"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/mailer";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

// El token se guarda como sha256 — nunca en claro
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function appUrl(): string {
  return process.env.APP_URL || "https://ac.sosaalcalde.com";
}

function resetLink(token: string): string {
  return `${appUrl()}/restablecer-contrasena?token=${token}`;
}

function emailLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es"><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#1d4ed8;padding:20px 28px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px;color:#334155;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f8fafc;color:#94a3b8;font-size:12px;">
          Acción Comunitaria · Si no solicitaste esto, ignora este correo.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Recuperación de contraseña ───────────────────────────────────────────────
// Respuesta genérica: no revela si el correo existe en el sistema.

export async function forgotPasswordAction(email: string) {
  const headerStore = await headers();
  const clientIp = getClientIp(headerStore);
  const rl = checkRateLimit(`forgot:${clientIp}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo más tarde." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true }; // genérico
  }

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const link = resetLink(token);
  const html = emailLayout(
    "Recuperación de contraseña",
    `<p>Hola <strong>${user.name}</strong>,</p>
     <p>Recibimos una solicitud para restablecer tu contraseña de Acción Comunitaria.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${link}" style="background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">Restablecer contraseña</a>
     </p>
     <p>El enlace es válido por <strong>1 hora</strong> y se usa una sola vez.</p>`
  );

  try {
    await sendEmail({ to: user.email, subject: "Recuperación de contraseña — Acción Comunitaria", html });
  } catch (e) {
    console.error("[password] Error enviando correo de recuperación:", e);
  }

  return { success: true };
}

// ── Restablecer contraseña ───────────────────────────────────────────────────

export async function resetPasswordAction(token: string, password: string) {
  if (!token || typeof password !== "string" || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "El enlace es inválido o ya expiró. Solicita uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, mustChangePassword: false },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}

// ── Bienvenida al crear usuario (alta) ───────────────────────────────────────
// Genera un token de un solo uso y envía el link para definir la contraseña.

export async function issuePasswordResetForUser(
  userId: number,
  email: string,
  fullName: string,
  inviteCode?: string | null
) {
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const link = resetLink(token);
  const inviteBlock = inviteCode
    ? `<p>Tu <strong>código de invitación</strong> para compartir con los afiliados que se registren bajo tu liderazgo es: <strong style="background:#e0e7ff;padding:4px 10px;border-radius:6px;">${inviteCode}</strong></p>`
    : "";
  const html = emailLayout(
    "¡Bienvenido a Acción Comunitaria!",
    `<p>Hola <strong>${fullName}</strong>,</p>
     <p>Tu cuenta fue creada en el sistema de Acción Comunitaria.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${link}" style="background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">Definir mi contraseña</a>
     </p>
     <p>El enlace es válido por <strong>1 hora</strong> y se usa una sola vez. Luego podrás entrar con tu correo y tu nueva contraseña.</p>
     ${inviteBlock}`
  );

  await sendEmail({
    to: email,
    subject: "Bienvenido a Acción Comunitaria",
    html,
  });
}
