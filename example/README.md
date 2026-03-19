# Example app

A full-stack team directory used as the demo target for [Claw Architecture](../README.md). Intentionally dependency-light so it is easy to run and easy for agents to reason about.

## Stack

- UI: static HTML, CSS, and browser JavaScript
- API: Node.js HTTP server
- Database: SQLite
- Gateway: Nginx (optional, for the Docker flow)

## Requirements

- Node.js `22.16+`
- Docker (only needed for the gateway flow)

No `npm install` step required.

## Local run

Terminal 1:

```bash
npm run db:init
npm run api
```

Terminal 2:

```bash
npm run ui
```

Open `http://localhost:3000`. The UI talks directly to `http://localhost:3001/api`.

## Docker run

```bash
docker compose up --build
```

Open `http://localhost`. Nginx proxies both the UI and API.

## Validation

```bash
npm run check
```

Runs the API test suite and a smoke test against a live server. No external services required.

You can also run them separately:

```bash
npm run test   # unit/integration tests
npm run smoke  # end-to-end smoke test
```

## API reference

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | health check |
| GET | `/api/members` | list members |
| GET | `/api/members/:id` | get one member |
| POST | `/api/members` | create member |
| PUT | `/api/members/:id` | update member |
| DELETE | `/api/members/:id` | delete member |

### Member fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | auto-assigned |
| `name` | string | required |
| `role` | string | required |
| `email` | string | required, unique |
| `department` | string | optional |
| `createdAt` | ISO timestamp | set on create |
| `updatedAt` | ISO timestamp | updated on write |

### Create / update body

```json
{
  "name": "Jordan Lee",
  "role": "Frontend Engineer",
  "email": "jordan.lee@example.com",
  "department": "Engineering"
}
```

`PUT` accepts any subset of fields; omitted fields are preserved.

## Database notes

`npm run db:init` is safe to run against an existing database — the schema uses `CREATE TABLE IF NOT EXISTS` and a migration in `ensureDatabase()` adds any new columns automatically.

## Example cross-layer feature

```
Add profile photo upload for team members.
```

This naturally touches every layer — which is exactly why it is a good target for the claw model:

| Layer | Change |
| --- | --- |
| `database/` | add `photo_url` column |
| `api/src/` | accept upload, return `photoUrl` in responses |
| `gateway/nginx.conf` | expose `/uploads/` as a public route |
| `ui/` | upload control + photo rendering |
