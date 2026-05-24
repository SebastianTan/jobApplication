# Job Application Tracker

A local-first web app to track job applications — company, role, status, dates, notes, and job descriptions stored as files on disk (with paths tracked in SQLite). Built with Next.js, React, TypeScript, Prisma, and SQLite.

**License:** [MIT](LICENSE)

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io/) + SQLite (file database)
- [Zod](https://zod.dev/) for API validation
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Prerequisites

- Node.js 20+
- npm

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd job-application-tracker
npm install
```

### 2. Environment variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="file:./data/applications.db"
```

Only `DATABASE_URL` is required. There are no API keys or passwords for local use. Never commit `.env` or `.env.local`.

### 3. Database

Create the data directory and run migrations:

```bash
mkdir -p data/job-descriptions
npx prisma migrate dev
```

Optional — load sample data for demos:

```bash
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed sample applications |

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/applications` | `GET` | List applications (`?status=INTERVIEW` optional) |
| `/api/applications` | `POST` | Create application |
| `/api/applications/[id]` | `GET` | Get one application |
| `/api/applications/[id]` | `PATCH` | Update application |
| `/api/applications/[id]` | `DELETE` | Delete application |
| `/api/applications/[id]/job-description` | `GET` | Read job description file content |
| `/api/applications/[id]/job-description` | `PUT` | Save content to `data/job-descriptions/{id}.md` and store path in DB |
| `/api/applications/[id]/job-description` | `DELETE` | Remove description file and clear DB path |

## Job description files

- Content is stored as markdown files under `data/job-descriptions/` (gitignored with `data/`).
- The `Application.jobDescriptionFile` column stores the relative path (e.g. `data/job-descriptions/clxyz….md`).
- Deleting an application also deletes its description file.
- Max file size: 512 KB per description.
- Optional env: `JOB_DESCRIPTIONS_DIR` to customize the storage directory.

## Security notes

- Intended for **local, single-user** use. There is no authentication.
- If you deploy this publicly without adding auth, anyone with the URL can read and modify your data.
- Keep secrets out of git: `.env*` is gitignored except `.env.example`.
- The SQLite database and job description files live in `data/` and are gitignored.

## Project structure

```text
app/                  # Next.js pages and API routes
components/           # React UI components
lib/                  # DB client, types, validation
prisma/               # Schema, migrations, seed
data/                 # SQLite file (local only, gitignored)
```

## CI

GitHub Actions runs lint and build on push/PR (see `.github/workflows/ci.yml`). No secrets are required in CI — the build uses a temporary SQLite path.

"© 2026 Sebastian Tan. All rights reserved. This code is visible for review and educational purposes only. 
Unauthorised copying, modification, or distribution of this software is strictly prohibited."