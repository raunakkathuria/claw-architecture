# Team Directory demo

This is the runnable demo app used in the Claw Architecture blog post.

## Stack

- UI: static HTML, CSS, and browser JavaScript
- API: Node.js HTTP server
- Database: SQLite
- Gateway: Nginx (optional, for Docker/local reverse-proxy shape)

## Why this stack

The demo is intentionally dependency-light so the repository is easy to run and easy for agents to reason about.

## Requirements

- Node.js `22.16+`
- Docker, if you want the gateway-based flow

No `npm install` step is required for the local flow.

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

Open `http://localhost:3000`.

The standalone UI server talks directly to `http://localhost:3001/api`.

## Docker run

```bash
docker compose up --build
```

Open `http://localhost`.

In Docker, Nginx proxies the UI and API.

## Validation

```bash
npm run test
npm run smoke
# or
npm run check
```

## Current API

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

The schema uses `CREATE TABLE IF NOT EXISTS`, so `npm run db:init` is safe to run against an existing database — it will not drop or reset data. A migration in `ensureDatabase()` automatically adds any new columns (such as `department`) to pre-existing databases, so upgrading from an older checkout requires no manual steps.

## Example cross-layer feature prompt

```
Add profile photo upload for team members.
```

That would naturally touch:

- `database/` for schema changes
- `api/src/` for new response fields and upload handling
- `gateway/nginx.conf` for file serving
- `ui/` for the upload and display flow
