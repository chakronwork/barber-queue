# Barber Queue Management System

A queue management system for a barbershop. Built as a full-stack portfolio project covering authentication, CRUD operations, input validation, route protection, automated testing, and containerized deployment.

The UI strings are in Thai. The codebase, comments, and documentation are in English.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS v4, SweetAlert2
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Auth:** JWT (`jose`), `bcryptjs`, httpOnly cookies
- **Validation:** Zod
- **Testing:** Vitest
- **Runtime / Deploy:** Docker (multi-stage), Railway

## Features

- JWT authentication with httpOnly cookie session
- Full CRUD for queue entries (list, create, view, update, delete)
- Status workflow: `pending` → `in_progress` → `done` / `cancelled`
- Protected routes via Next.js middleware (pages + API)
- Server-side input validation with Zod; parameterized queries via Drizzle
- Admin dashboard UI with status badges and summary stats
- Unit and API route tests with a mocked database layer
- Reproducible local environment via Docker Compose
- Production-ready multi-stage Dockerfile

## Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose (for the local database / full-stack run)

## Local Development

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd barber-queue

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.example .env   # or create .env manually (see "Environment Variables")

# 4. Start the local PostgreSQL database
docker compose up -d db

# 5. Push the schema and seed the admin user
npm run db:push
npm run db:seed

# 6. Run the dev server
npm run dev
```

Open http://localhost:3000. You will be redirected to the login page.

## Environment Variables

Create a `.env` file at the project root.

| Variable       | Description                              | Example                                          |
| -------------- | ----------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string             | `postgres://barber:barber123@localhost:5432/barber_queue` |
| `JWT_SECRET`   | Secret used to sign and verify JWTs      | `change-me-to-a-long-random-string`              |

In production, `DATABASE_URL` is provided by the hosting platform (e.g. a Railway PostgreSQL service). `JWT_SECRET` must be set as a secret variable and should be a long random string.

## Database

Schema and seed scripts live in `src/db/`.

```bash
npm run db:push   # push schema to the database (no migrations)
npm run db:seed   # create the default admin user (idempotent)
```

`db:seed` checks for an existing `admin` user before inserting, so it is safe to run repeatedly.

## Testing

The test suite covers Zod schemas, JWT helpers, and all API route handlers. The database is mocked at the module level using `vi.hoisted`, so tests run without a live PostgreSQL instance.

```bash
npm test          # run once
npm run test:watch
```

Current coverage: 26 tests across 5 files (schemas, auth, `/api/login`, `/api/queues`, `/api/queues/[id]`).

## Docker

### Full local stack (app + database)

```bash
docker compose up --build -d
docker compose ps
```

The app is served at http://localhost:3000 and the database at `localhost:5432`.

> Note: when running the app container for the first time against an empty database, run the schema push and seed once against the containerized database (see "Database"), or configure a pre-start step. The `DATABASE_URL` inside Compose points to the `db` service host.

### Build the production image only

```bash
docker build -t barber-queue .
```

The image uses a multi-stage build and ships a standalone Next.js server.

## Deployment (Railway)

1. Push the repository to GitHub.
2. On Railway, create a new project from the GitHub repo.
3. Add a **PostgreSQL** database service.
4. On the app service, set the variables:
   - `JWT_SECRET` = a long random string
   - `DATABASE_URL` = the value from the PostgreSQL service
5. Set the **Pre-Deploy Command** to:
   ```bash
   npm run db:push
   ```
6. Deploy. After the first successful deploy, run the seed once (see "Seeding production" below), then you may keep the pre-deploy command as `npm run db:push`.

### Seeding production

The production database starts empty. To create the admin user, temporarily set the pre-deploy command to:

```bash
npm run db:push && npm run db:seed
```

Deploy once, confirm the admin user can log in, then revert the pre-deploy command to `npm run db:push` so the seed does not run on every deploy.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── queues/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── login/page.tsx
│   ├── queues/
│   │   ├── page.tsx          # list
│   │   ├── new/page.tsx      # create form
│   │   └── [id]/page.tsx     # detail / edit
│   ├── layout.tsx
│   ├── page.tsx              # redirects to /queues
│   └── globals.css
├── db/
│   ├── index.ts              # drizzle client
│   ├── schema.ts             # users, queues tables
│   └── seed.ts
├── lib/
│   ├── auth.ts               # signToken / verifyToken
│   ├── queue-schema.ts       # Zod schemas
│   └── queue-labels.ts       # display labels
├── middleware.ts             # route protection
└── test/
    └── setup.ts
drizzle.config.ts
Dockerfile
docker-compose.yml
vitest.config.ts
```

## API Reference

All queue endpoints require a valid session cookie. Unauthenticated requests to `/api/queues*` return `401`.

| Method   | Path                | Auth | Description              |
| -------- | ------------------- | ---- | ------------------------ |
| `POST`   | `/api/login`        | No   | Authenticate, set cookie |
| `POST`   | `/api/logout`       | Yes  | Clear session cookie     |
| `GET`    | `/api/queues`       | Yes  | List all queues          |
| `POST`   | `/api/queues`       | Yes  | Create a queue           |
| `GET`    | `/api/queues/:id`   | Yes  | Get one queue            |
| `PATCH`  | `/api/queues/:id`   | Yes  | Update a queue           |
| `DELETE` | `/api/queues/:id`   | Yes  | Delete a queue           |

Authentication is cookie-based. The server sets an httpOnly `token` cookie on login; clients do not handle the JWT directly.

### Example: create a queue

```bash
curl -b cookies.txt -X POST https://<host>/api/queues \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Somchai","service":"haircut","note":"short sides"}'
```

## Security

- **Broken Access Control:** protected pages and API routes are gated by middleware that verifies the JWT; unauthenticated page requests redirect to `/login`, unauthenticated API requests return `401`.
- **Injection:** request bodies are validated with Zod before use; database access uses Drizzle parameterized queries.
- **Authentication failures:** passwords are stored as bcrypt hashes; login returns a generic `invalid credentials` for both unknown users and wrong passwords to avoid user enumeration.
- **Session handling:** the JWT is stored in an httpOnly, SameSite=Lax cookie, not in client-accessible storage.

## Default Credentials

The seed script creates one user:

- Username: `admin`
- Password: `123456`

Change this immediately in any non-local environment.

## License

MIT
