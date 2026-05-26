# System Architecture

## Overview

This is a web-based job application tracking system built as a single-user application with authentication. The system allows users to track job applications through various stages of the hiring process, store job descriptions as separate markdown files, and maintain automated database backups.

## Technology Stack

### Frontend
- **Next.js 16** with App Router architecture
- **React 19** for UI components
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling

### Backend
- **Next.js API Routes** for server-side endpoints
- **Prisma ORM** for database operations
- **SQLite** as the embedded database
- **NextAuth v5** for authentication

### Validation
- **Zod** for runtime schema validation

## Directory Structure

```
app/                          # Next.js App Router
  api/                        # API endpoints
    applications/             # Application CRUD operations
    auth/                     # NextAuth configuration
    backups/                  # Backup management
  backups/                    # Backup UI page
  login/                      # Login page
  layout.tsx                  # Root layout with fonts
  page.tsx                    # Home page (dashboard)
  globals.css                 # Global styles

components/                   # React client components
  dashboard.tsx               # Main application container
  application-list.tsx        # Application card grid
  application-form.tsx        # Create/edit form
  application-modal.tsx       # Modal wrapper
  status-filter.tsx           # Status filter chips
  status-badge.tsx            # Status display component
  date-controls.tsx           # Date range and sort controls
  job-description-editor.tsx  # Markdown textarea
  job-description-modal.tsx   # Job description viewer/editor

lib/                          # Shared utilities
  db.ts                       # Prisma client singleton
  types.ts                    # TypeScript types
  validations.ts              # Zod schemas
  validations-job-description.ts  # Job description validation
  application-filters.ts      # Client-side filtering/sorting
  job-description-files.ts    # File system operations
  status-styles.ts            # Status styling utilities
  backup.ts                   # Backup utilities
  backup-scheduler.ts         # Automated backup scheduler

prisma/                      # Database configuration
  schema.prisma               # Database schema
  migrations/                 # Migration files
  seed.ts                     # Sample data

data/                        # Runtime data (gitignored)
  applications.db             # SQLite database
  job-descriptions/           # Markdown files
  backups/                    # Database backups
```

## Database Schema

### Application Model
```prisma
model Application {
  id                  String            @id @default(cuid())
  company             String
  role                String
  status              ApplicationStatus @default(APPLIED)
  appliedAt           DateTime?
  jobUrl              String?
  location            String?
  notes               String?
  jobDescriptionFile  String?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

enum ApplicationStatus {
  APPLIED
  SCREENING
  INTERVIEW
  OFFER
  REJECTED
  WITHDRAWN
}
```

## Authentication Flow

The application uses NextAuth v5 with a credentials provider:

1. **Middleware Protection**: The `middleware.ts` file intercepts all requests except `/login` and `/api/auth/*` routes
2. **Session Check**: Middleware validates the session using the `auth()` function
3. **Redirect**: Unauthenticated users are redirected to `/login`
4. **Credentials Provider**: Users authenticate with username/password (hardcoded: admin/password for demo)
5. **JWT Strategy**: Sessions are stored as JWTs
6. **Logout**: Users can sign out via the dashboard header

## API Endpoints

### Applications
- `GET /api/applications` - List all applications (optional `?status=` filter)
- `POST /api/applications` - Create new application
- `GET /api/applications/[id]` - Get single application
- `PATCH /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application (and associated description file)
- `GET /api/applications/[id]/job-description` - Read job description file
- `PUT /api/applications/[id]/job-description` - Save job description file
- `DELETE /api/applications/[id]/job-description` - Remove job description file

### Backups
- `GET /api/backups` - List all backup files
- `POST /api/backups` - Create new backup
- `GET /api/backups/[filename]` - Download backup file
- `DELETE /api/backups/[filename]` - Delete backup file

### Authentication
- `GET /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/[...nextauth]` - NextAuth handler

## Component Architecture

### State Management Pattern
The application uses a "lifting state up" pattern:

- **Dashboard** (`dashboard.tsx`): Holds all global state (applications, filters, modals)
- **Child Components**: Presentational components that receive data and callbacks as props
- **Controlled Components**: Parent owns the state, children report changes via callbacks

### Key Components

#### Dashboard
- Main client component with `"use client"` directive
- Manages application state with `useState` hooks
- Fetches data via `useEffect` when filters change
- Handles CRUD operations (create, update, delete)
- Manages modal states (create/edit form, job description viewer)
- Implements client-side filtering and sorting

#### ApplicationList
- Renders application cards in a grid layout
- Receives filtered/sorted applications as props
- Calls back to parent for edit/delete/view-description actions

#### ApplicationForm
- Controlled form component for creating/editing applications
- Includes validation via Zod schemas
- Integrates with JobDescriptionEditor for markdown content

#### StatusFilter
- Chip-based filter for application status
- Controlled component (value and onChange from parent)

#### DateControls
- Date range picker for filtering by application date
- Sort field and direction controls
- All state managed by parent Dashboard

#### JobDescriptionModal
- Modal for viewing/editing job descriptions
- Loads markdown content from API on mount
- Saves changes via API on submit

## Data Flow

### Create Application Flow
1. User clicks "Add application" in Dashboard
2. Dashboard opens ApplicationModal with `editing=null`
3. User fills form and submits
4. Dashboard calls `POST /api/applications` with form data
5. Server validates with Zod, creates database record
6. Dashboard saves job description file (if provided)
7. Dashboard refetches application list
8. Modal closes

### Update Application Flow
1. User clicks "Edit" on an application card
2. Dashboard opens ApplicationModal with `editing=application`
3. Form pre-populates with existing data
4. User modifies and submits
5. Dashboard calls `PATCH /api/applications/[id]` with changes
6. Server validates and updates database
7. Dashboard saves job description file (if changed)
8. Dashboard refetches application list
9. Modal closes

### Delete Application Flow
1. User clicks "Delete" on an application card
2. Dashboard shows confirmation dialog
3. If confirmed, calls `DELETE /api/applications/[id]`
4. Server deletes database record and job description file
5. Dashboard refetches application list

## File Storage

### Job Descriptions
- Stored as markdown files in `data/job-descriptions/{id}.md`
- Database stores only the relative path
- File operations include security checks:
  - Path validation (no directory traversal)
  - File size limit (512KB)
  - Automatic cleanup on application deletion

### Database Backups
- Stored in `data/backups/` directory
- Filename format: `applications-backup-{timestamp}.db`
- Created via SQLite backup API
- Can be downloaded or deleted via backup management UI

## Backup System

### Automatic Backups
- Scheduler initialized on server startup (in `lib/db.ts`)
- Runs hourly check for daily backup
- Creates backup if none exists for current day
- Uses timestamp-based naming to avoid conflicts

### Manual Backups
- Users can trigger immediate backup via `/backups` page
- Backup UI lists all available backups
- Users can download or delete individual backups

## Validation Strategy

### Server-Side Validation
- All API endpoints use Zod schemas
- Returns 400 with field errors on validation failure
- Schemas defined in `lib/validations.ts` and `lib/validations-job-description.ts`

### Client-Side Validation
- Form components use Zod schemas for type inference
- Validation errors displayed inline
- URL and date fields have specific validation rules

## Security Considerations

### Authentication
- All routes protected except `/login` and `/api/auth/*`
- Credentials provider with hardcoded credentials (demo only)
- JWT session strategy
- Secret key configurable via `NEXTAUTH_SECRET`

### File Operations
- Path validation prevents directory traversal attacks
- File size limits prevent resource exhaustion
- Automatic cleanup prevents orphaned files

### Input Validation
- All user input validated via Zod schemas
- URL fields validated for proper format
- String fields have length limits
- Optional fields properly handled

## Environment Configuration

### Required Variables
- `DATABASE_URL`: SQLite file path (default: `file:./data/applications.db`)
- `NEXTAUTH_SECRET`: Secret key for JWT signing (default provided for dev)

### Optional Variables
- `JOB_DESCRIPTIONS_DIR`: Custom directory for job description files

## Development Workflow

### Database Migrations
```bash
npm run db:migrate    # Apply Prisma migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Load sample data
```

### Build Process
```bash
npm run build         # Prisma generate + Next.js build
npm run dev           # Start development server
npm run start         # Start production server
```

## Performance Considerations

### Prisma Client Singleton
- Prisma client instantiated once in `lib/db.ts`
- Prevents hot-reload issues in development
- Attached to `globalThis` for persistence

### Client-Side Filtering
- Date filtering and sorting performed in browser
- Reduces API calls when changing filters
- Uses `useMemo` to avoid unnecessary recomputation

### Backup Scheduler
- Runs hourly check (not full backup every hour)
- Only creates backup if none exists for current day
- Minimal performance impact

## Error Handling

### API Errors
- All endpoints wrapped in try-catch
- Returns appropriate HTTP status codes
- Error messages included in JSON response
- Validation errors return field-level details

### Client Errors
- Dashboard displays error messages in UI
- Loading states prevent duplicate requests
- Cleanup on component unmount

## Future Considerations

### Scalability
- SQLite suitable for single-user application
- Would need migration to PostgreSQL/MySQL for multi-user
- File storage could move to cloud storage for distributed deployment

### Authentication
- Current credentials provider is for demo only
- Could integrate OAuth providers (Google, GitHub)
- Could add user registration flow

### Features
- Export/import functionality
- Advanced search and filtering
- Analytics and reporting
- Email notifications for status changes
