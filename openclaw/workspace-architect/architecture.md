# Team Directory architecture

```
UI (static HTML/CSS/JS) -> Gateway (Nginx) -> API (Node.js) -> Database (SQLite)
```

## Paths

| Layer | Path | Default port |
| --- | --- | --- |
| UI | `project/team-directory/ui/` | 3000 |
| Gateway | `project/team-directory/gateway/nginx.conf` | 80 |
| API | `project/team-directory/api/src/` | 3001 |
| Database | `project/team-directory/database/` | file-backed |
| Validation | `project/team-directory/tests/` and `project/team-directory/scripts/` | n/a |

## API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | health check |
| GET | `/api/members` | list members |
| GET | `/api/members/:id` | get one member |
| POST | `/api/members` | create member |
| PUT | `/api/members/:id` | update member |
| DELETE | `/api/members/:id` | delete member |
