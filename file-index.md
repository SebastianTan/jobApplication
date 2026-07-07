i**55 source files:**

**Markdown (6)**
- AGENTS.md - Agent rules for AI assistants working on this codebase
- ARCHITECTURE.md - Current architecture documentation
- ARCHITECTURE_V2.md - Previous version of architecture docs
- ARCHITECTURE_V3.md - Another version of architecture docs
- CLAUDE.md - Reference to AGENTS.md
- README.md - Project documentation and setup instructions

**App/API Routes (6)**
- app/api/applications/[id]/job-description/route.ts - GET/PUT/DELETE job description markdown files
- app/api/applications/[id]/route.ts - GET/PATCH/DELETE single application
- app/api/applications/route.ts - GET (list), POST (create) applications
- app/api/auth/[...nextauth]/route.ts - NextAuth authentication with credentials provider
- app/api/backups/[filename]/route.ts - GET (download), DELETE backup files
- app/api/backups/route.ts - GET (list), POST (create) database backups

**App/Pages (5)**
- app/backups/page.tsx - Backup management UI (list, create, download, delete)
- app/login/page.tsx - Login page with NextAuth credentials
- app/page.tsx - Home page that renders Dashboard component
- app/layout.tsx - Root layout with fonts and global structure
- app/globals.css - Global Tailwind CSS styles

**Components (9)**
- components/application-form.tsx - Create/edit form with controlled inputs
- components/application-list.tsx - Renders application cards (presentational)
- components/application-modal.tsx - Modal wrapper for add/edit form
- components/dashboard.tsx - Main screen with state management and API calls
- components/date-controls.tsx - Date range filter and sort controls
- components/job-description-editor.tsx - Textarea for markdown job descriptions
- components/job-description-modal.tsx - Modal for viewing/editing descriptions
- components/status-badge.tsx - Colored status label component
- components/status-filter.tsx - Status filter chip buttons

**Lib (9)**
- lib/application-filters.ts - Client-side date filtering and sorting logic
- lib/backup-scheduler.ts - Daily backup scheduler (checks hourly)
- lib/backup.ts - Database backup utilities (create, list, delete)
- lib/db.ts - Prisma client singleton and backup scheduler init
- lib/job-description-files.ts - File system operations for descriptions
- lib/status-styles.ts - Tailwind classes for status badges
- lib/types.ts - TypeScript types and serialization helpers
- lib/validations-job-description.ts - Zod schema for job descriptions
- lib/validations.ts - Zod schemas for application validation

**Prisma (6)**
- prisma/migrations/20260523173559_init/migration.sql - Initial database schema
- prisma/migrations/20260523175515_add_job_description_file/migration.sql - Added job description file field
- prisma/migrations/20260608172415_ok/migration.sql - Added FOUND status enum value
- prisma/migrations/migration_lock.toml - Migration lock file
- prisma/schema.prisma - Prisma schema with Application model
- prisma/seed.ts - Sample data seeding script

**Config/Root (9)**
- app/favicon.ico - Browser favicon
- eslint.config.mjs - ESLint configuration
- middleware.ts - Next.js middleware for route protection
- next-env.d.ts - Next.js TypeScript type definitions
- next.config.ts - Next.js configuration
- package-lock.json - npm dependency lock file
- package.json - Project dependencies and scripts
- postcss.config.mjs - PostCSS configuration for Tailwind
- tsconfig.json - TypeScript compiler configuration

**Public (6)**
- public/file.svg - File icon SVG
- public/globe.svg - Globe icon SVG
- public/next.svg - Next.js logo SVG
- public/vercel.svg - Vercel logo SVG
- public/window.svg - Window icon SVG