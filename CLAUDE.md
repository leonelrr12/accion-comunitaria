# CLAUDE.md — Acción Comunitaria

## Regla crítica

- **NO ejecutar `npm run build` en cada modificación de código.** El build se corre solo cuando se va a desplegar (y el deploy incluye el build).

## Despliegue (PM2, producción)

App Next.js 16 **standalone** en PM2 (`comunitaria-app`, puerto 3006, cluster x4). Dominio: https://ac.sosaalcalde.com (nginx → 127.0.0.1:3006).

**Pasos del deploy (siempre en este orden):**
```bash
npm run build
cp -r .next/static .next/standalone/.next/   # SIN esto la web queda sin CSS/JS
cp -r public .next/standalone/
pm2 reload comunitaria-app
```
Los archivos nuevos en `public/` **no los sirve el standalone** (ni siquiera tras el copy): requieren una `location` estática en `/etc/nginx/sites-enabled/ac.sosaalcalde.com` (ej. guia-induccion.html, logo_ac-3.png, og-image.png).

**Cambios en `.env`:** el standalone usa SU PROPIA copia hecha al build (`.next/standalone/.env`). Después de editar el `.env` raíz:
```bash
cp .env .next/standalone/.env && pm2 reload comunitaria-app
```

## Base de datos

- PostgreSQL propio en **5434** (contenedor `comunitaria-db`, volumen `comunitaria_data`, límites 1g/2cpus, bind 127.0.0.1). Usuario dedicado `comunitaria` (no superuser; credenciales en `.env`).
- **NO usar 5432** (crmge-db) ni 5433 (agt-contador) — son de otros servicios en producción.
- Migraciones: `npx prisma migrate dev --create-only --name X` requiere el superuser para la shadow DB: `DATABASE_URL="postgresql://postgres:<pass>@localhost:5434/db_comuna"`; luego `npx prisma migrate deploy`.
- Backups diarios: 3:17 AM → `/root/backups/comunitaria/` (script `/usr/local/bin/backup-comunitaria.sh`, retención 14 días).

## Dominio del negocio

- **Jerarquía de roles** por `level` (columna en `roles`): ADMIN=1 (fuera de la jerarquía), Lider Global=2, Lider de Corregimiento=3, Lider de Comunidad=4, Coordinador=5, Activista=6. Un rol solo crea roles con level MAYOR (número más alto).
- **ADMIN está fuera de la jerarquía**: no aparece en "Líder Superior" ni en el árbol; puede crear cualquier rol (incluido otro ADMIN) y solo asigna padre si lo elige explícitamente. Excepción: el **super admin por ID** (`SUPER_ADMIN_ID` en `.env`, actualmente 3) ve como ADMIN pero NO puede crear otros ADMIN.
- **Ubicación por rol**: Global/ADMIN sin ubicación (nacional); niveles 3-5 requieren provincia+distrito (corregimiento/comunidad en blanco = multi-zona); Activista requiere TODO (incl. comunidad); afiliados requieren comunidad.
- Los nombres de los roles los renombró el usuario — **no hardcodear nombres de roles en el código** (usar `level`).
- Al crear un usuario de rol ≠ Global, el Líder Superior es obligatorio en la UI (salvo ADMIN creando Global).

## Gotchas del código (lecciones aprendidas)

- **Relaciones de Prisma con nombres invertidos** (schema original): `User.leaders` = filas donde el usuario es el **SUBORDINADO** (su padre); `User.subordinates` = filas donde es el **LÍDER** (sus hijos). El padre se lee con `leaders[0].leader`.
- **Sesiones**: cookies cifradas sin estado (sobreviven cambios de contraseña). El middleware NO rebota `/login` con sesión vieja (atrapaba a usuarios). El store (zustand) persiste en localStorage; la restauración real es vía `/api/auth/me` (SessionProvider) — no confiar en el store persistido como fuente de sesión.
- **Env vars clientes**: usar prefijo `NEXT_PUBLIC_` (se inlinan al build). Server-side sin prefijo (runtime).
- **Server actions**: todas las mutaciones llevan guards (`requireAuth`/`requireAdmin` de `src/lib/auth-guard.ts`). `createAffiliate` es PÚBLICO por diseño (registro con código de invitación).
- **Modal de edición / estados**: usar actualizaciones funcionales (`setState(prev => ...)`) en setters encadenados (LocationSelector) — el patrón con closure viejo pisaba selecciones.
- **Agente IA**: usa DeepSeek (OpenAI-compatible), NO Ollama. `src/lib/ai/agent.ts` hace fetch a api.deepseek.com (chat() y streamChat()).
