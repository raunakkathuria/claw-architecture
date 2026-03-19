# Claw Architecture

One brain. Multiple claws. Each claw owns one layer.

This repository is a working reference for running a multi-agent coding setup with [OpenClaw](https://openclaw.ai). The idea: instead of one agent that tries to understand every layer of your stack, you give each domain its own agent and a shared orchestrator that coordinates across them.

## What's in here

| Directory | What it is |
| --- | --- |
| `example/` | A runnable full-stack demo app (UI + API + SQLite + Nginx) |
| `openclaw/` | Workspace bootstrap for running the multi-agent setup locally |
| `blog/` | The write-up behind this repo |

## The architecture

```
                     Architect agent
                     (orchestration)
                           |
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
       UI claw         API claw         DB claw
    presentation      contracts       schema/data
```

Each agent workspace is isolated — its own memory, notes, and working directory. A `project/` symlink inside each workspace points at the same shared repository checkout, so agents collaborate on the same codebase without stepping on each other.

## Quick start

```bash
cd example
npm run db:init && npm run api
# second terminal:
npm run ui
```

Open `http://localhost:3000`. See [`example/README.md`](example/README.md) for Docker, validation, and API details.

## Set up the multi-agent workspace

1. Install and onboard [OpenClaw](https://openclaw.ai) first.
2. Run the bootstrap:

```bash
cd openclaw
./setup.sh /absolute/path/to/claw-architecture
```

3. Merge `openclaw/agents-snippet.json` into your `~/.openclaw/openclaw.json`.

This creates four isolated agent workspaces (architect, frontend, backend, database), each with a shared `project/` symlink back to this repo. See [`openclaw/README.md`](openclaw/README.md) for the full walkthrough.

## How the claw model works in practice

Once the workspace bootstrap is done, here is what a typical feature request looks like end to end.

### 1. Send the feature to the architect

```
You → Architect agent:

"Add a department filter to the member list.
 Members should be filterable by department on both the API and the UI."
```

### 2. Architect plans and defines the interface contract

The architect inspects the codebase (`project/example/`) and writes down the cross-layer contract before any code changes:

```
Field name:  department  (already in DB schema)
API change:  GET /api/members?department=Engineering
UI change:   dropdown filter above the member list
No gateway change needed.
```

### 3. Architect delegates by domain

```
→ DB claw:   confirm department column exists; add index if needed
→ API claw:  add ?department= query param to GET /api/members
→ UI claw:   add department dropdown; filter member list on change
```

Each claw works within its own files:

| Claw | Owns |
| --- | --- |
| DB | `example/database/` |
| API | `example/api/src/` |
| UI | `example/ui/` |

### 4. Architect integrates and validates

Once the claws report back, the architect pulls the changes together and runs the real check:

```bash
cd project/example
npm run check
```

All 4 tests pass → ship it.

---

The key discipline: **the architect defines the contract first**. Field names, response shapes, and validation rules are agreed up front so the DB, API, and UI claws never drift out of sync.

## Repository layout

```
claw-architecture/
├── example/          ← runnable demo app
├── openclaw/         ← agent workspace bootstrap
└── blog/             ← the write-up
```

## License

MIT
