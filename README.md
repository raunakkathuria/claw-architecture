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

## Quick start: example app

### Local

```bash
cd example
npm run db:init
npm run api
```

In a second terminal:

```bash
cd example
npm run ui
```

Open `http://localhost:3000`.

### Docker

```bash
cd example
docker compose up --build
```

Open `http://localhost`.

### Validate

```bash
cd example
npm run check
```

`npm run check` runs the API test suite and a smoke test against a live server. No install step required — the app has zero runtime dependencies.

## Quick start: OpenClaw multi-agent setup

1. Install and onboard OpenClaw first.
2. Run the bootstrap script:

```bash
cd openclaw
./setup.sh /absolute/path/to/claw-architecture
```

3. Merge `openclaw/agents-snippet.json` into your `~/.openclaw/openclaw.json`.

See `openclaw/README.md` for the full walkthrough.

## Repository layout

```
claw-architecture/
├── example/
│   ├── README.md
│   ├── package.json
│   ├── docker-compose.yml
│   ├── api/
│   ├── database/
│   ├── gateway/
│   ├── scripts/
│   ├── tests/
│   └── ui/
├── openclaw/
│   ├── README.md
│   ├── setup.sh
│   ├── agents-snippet.json
│   └── workspace-*/
└── blog/
    └── claw-architecture-with-buildwright.md
```

## License

MIT
