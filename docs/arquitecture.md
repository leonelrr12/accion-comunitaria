## Architecture

### Database Models (Prisma)

- **Province** → **District** → **Corregimiento** → **Community** (geographic hierarchy)
- **Role** (user roles)
- **User** (with hierarchical relationships via UserHierarchy)
- **Person** (affiliates/leadership)

### Routes Structure

- `/login`, `/registro` - Authentication
- `/admin/dashboard/*` - Admin panel (geography, hierarchy, roles, users management)
- `/dashboard/*` - User dashboard (affiliates management)
- `/admin/dashboard/nuevo-lider` - Leader creation with invite codes

### Key Files

- `src/app/actions/*.ts` - Server actions for data mutations
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/store.ts` - Zustand store for UI state
- `src/lib/rateLimit.ts` - Rate limiting for authentication
- `src/lib/validation.ts` - Zod validation schemas
- `src/middleware.ts` - Authentication middleware
- `prisma/schema.prisma` - Database schema
