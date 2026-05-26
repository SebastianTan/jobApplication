# Architecture

## Overview
Local-first job application tracker using Next.js App Router with server-side rendering and SQLite for data persistence.

## Frontend
- **Next.js 16 App Router**: Server components by default, client components marked with `"use client"`
- **React 19**: UI rendering with hooks for state management
- **TypeScript**: Full-stack type safety
- **Tailwind CSS 4**: Utility-first styling

## Backend
- **Next.js API Routes**: RESTful endpoints in `app/api/`
- **NextAuth**: JWT-based authentication with credentials provider
- **Middleware**: Route protection at `middleware.ts`

## Data Layer
- **Prisma ORM**: Type-safe database queries with auto-generated client
- **SQLite**: File-based database at `data/applications.db`
- **Job Descriptions**: Markdown files stored in `data/job-descriptions/`
- **Backups**: Scheduled daily backups to `data/backups/`

## Key Patterns
- **Lifting State Up**: Dashboard component holds global state, children are presentational
- **Server Components**: Data fetching on server, minimal client JavaScript
- **Validation**: Zod schemas for API route validation
- **File Storage**: Job descriptions as files with paths tracked in database

## Security
- Authentication required for all routes except `/login` and `/api/auth`
- Path validation for file operations (prevents directory traversal)
- Environment variables for secrets (`.env.local` gitignored)

## Data Flow
1. Client component fetches from API routes
2. API routes validate with Zod, query Prisma
3. Prisma executes SQLite queries
4. Job descriptions read/written via file system
5. Responses serialized and returned as JSON
