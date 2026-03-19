# Naming conventions

## Per layer

| Layer | Convention | Example |
| --- | --- | --- |
| Database | snake_case | `photo_url` |
| API JSON | camelCase | `photoUrl` |
| UI state | camelCase | `photoUrl` |
| Routes | kebab-case segments | `/api/members/1` |

## Canonical field registry

| Concept | Database | API | UI |
| --- | --- | --- | --- |
| member id | `id` | `id` | `id` |
| name | `name` | `name` | `name` |
| role | `role` | `role` | `role` |
| email | `email` | `email` | `email` |
| created timestamp | `created_at` | `createdAt` | `createdAt` |
| updated timestamp | `updated_at` | `updatedAt` | `updatedAt` |

Add any new shared fields here before the claws implement them.
