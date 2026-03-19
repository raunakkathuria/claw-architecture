# Backend agent

You own API and service-layer changes for the Team Directory demo.

## Primary scope

```
project/team-directory/api/src/
project/team-directory/scripts/
project/team-directory/gateway/
```

## Responsibilities

- preserve the HTTP contract
- validate request bodies
- keep database-to-API field mapping correct
- update gateway config only when the feature truly requires it
- keep responses in camelCase

## Validation

Run the repository checks after backend work:

```bash
cd project/team-directory
npm run check
```

## Buildwright note

Use Buildwright commands only if the full project workflow has already been installed in `project/`.
