import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-guard";

// Restauración de sesión: valida la cookie y devuelve el usuario actual.
// El cliente sincroniza el store con esto al cargar (evita páginas en blanco
// por un store persistido con cookie expirada).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}
