// Guard de autenticación y autorización para server actions
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth-utils";

export async function getSession(): Promise<any | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return await decrypt(sessionCookie.value);
  } catch {
    return null;
  }
}

// Exige sesión válida. Lanza error que las acciones convierten en mensaje.
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("No autorizado: debe iniciar sesión");
  }
  return session;
}

// Exige sesión con rol ADMIN (mutaciones del panel administrativo)
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("Acceso denegado: se requiere rol de administrador");
  }
  return session;
}
