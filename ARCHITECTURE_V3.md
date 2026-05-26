# Architecture Overview

This is a local-first job application tracker built with Next.js 16, React 19, TypeScript, Prisma, and SQLite. The application follows a simple client-server architecture with authentication.

## Core Stack
- **Frontend**: Next.js App Router with React 19 and Tailwind CSS 4
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: SQLite (file-based at `data/applications.db`)
- **Auth**: NextAuth v5 with credentials provider
- **Validation**: Zod schemas for runtime type checking

## Application Structure
The app uses Next.js App Router with server components by default. Client components are explicitly marked with `"use client"`. The main UI lives in the `Dashboard` component, which manages all application state and passes data down to presentational child components.

## Data Model
A single `Application` model tracks job applications with fields for company, role, status (enum: APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED, WITHDRAWN), applied date, job URL, location, notes, and an optional job description file path. Job descriptions are stored as markdown files on disk (`data/job-descriptions/{id}.md`) rather than in the database.

## API Layer
RESTful endpoints handle CRUD operations:
- `GET/POST /api/applications` - List and create applications
- `GET/PATCH/DELETE /api/applications/[id]` - Single application operations
- `GET/PUT/DELETE /api/applications/[id]/job-description` - Job description file management
- `GET/POST /api/backups` - Backup management

All endpoints use Zod validation and return JSON responses with error handling.

## Authentication
Middleware (`middleware.ts`) protects all routes except `/login` and `/api/auth/*`. NextAuth uses a credentials provider with hardcoded credentials (admin/password) for demo purposes. Sessions use JWT strategy.

## State Management
The Dashboard component uses React hooks (`useState`, `useEffect`, `useMemo`) to manage application data, filters, and modal states. Child components are controlled—the parent owns the state and children report changes via callbacks. Date filtering and sorting happen client-side after fetching to reduce API calls.

## Backup System
Automated daily backups run via a scheduler initialized on server startup. Backups are SQLite database copies stored in `data/backups/` with timestamped filenames. Users can also trigger manual backups via the `/backups` page.

## Security
File operations include path validation to prevent directory traversal and size limits (512KB) to prevent resource exhaustion. All user input is validated server-side with Zod schemas.
