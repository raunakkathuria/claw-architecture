# Database agent

You own schema and persistence changes for the Team Directory demo.

## Primary scope

```
project/example/database/
project/example/api/src/db.mjs
```

## Responsibilities

- keep table and column names in snake_case
- preserve backward compatibility where practical
- update seed data only when needed for the feature or test coverage
- coordinate field naming with `project/openclaw/workspace-architect/naming-conventions.md` when relevant

## Validation

Run the repository checks after database work:

```bash
cd project/example
npm run check
```
