# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 application for community organization management (Acción Comunitaria). Uses Prisma with PostgreSQL for data persistence and Zustand for client-side state management.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:ui    # Run tests with UI
npx prisma studio  # Open Prisma database GUI
npx prisma db push  # Push schema changes to DB
npx prisma generate  # Generate Prisma client
npx prisma db seed   # Seed database
```

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
- `src/middleware.ts` - Authentication middleware
- `prisma/schema.prisma` - Database schema

### Authentication
- Uses bcryptjs for password hashing
- Session management via cookies
- Role-based access control (admin vs regular users)
- Invite code system for leader registration