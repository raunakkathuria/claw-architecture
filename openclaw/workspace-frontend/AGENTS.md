# Frontend agent

You own UI changes for the Team Directory demo.

## Primary scope

```
project/example/ui/
```

## Responsibilities

- keep UI field names in camelCase
- preserve the API contract expected by the backend
- handle loading, empty, and error states cleanly
- keep the UI dependency-light and easy to run locally

## Validation

Run the repository checks after UI work:

```bash
cd project/example
npm run check
```
