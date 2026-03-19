# Claw Architecture

One brain. Multiple claws. Each claw owns one layer.

This repository packages three things that now line up cleanly:

1. a working demo app under `team-directory/`
2. an honest, publishable blog post under `blog/`
3. an OpenClaw workspace bootstrap under `openclaw/`

The original draft mixed a good idea with setup claims that were stronger than the code. This version fixes that.

## What is included

- **Working demo app:** static UI + Node.js API + SQLite + optional Nginx gateway
- **Automated validation:** API tests and a smoke test
- **OpenClaw bootstrap:** isolated agent workspaces with a shared `project/` symlink into this repository
- **Shared Buildwright skill install:** useful as workflow guidance inside OpenClaw

## What is not claimed anymore

- The repository does **not** pretend the full Buildwright slash-command workflow is already installed.
- The repository does **not** claim automatic PR creation, linting, security scans, or code review unless you separately install the full Buildwright project workflow.

## Repository layout

```
claw-architecture/
├── blog/
│   └── claw-architecture-with-buildwright.md
├── openclaw/
│   ├── README.md
│   ├── setup.sh
│   ├── agents-snippet.json
│   └── workspace-*/
└── team-directory/
    ├── README.md
    ├── package.json
    ├── docker-compose.yml
    ├── api/
    ├── database/
    ├── gateway/
    ├── scripts/
    ├── tests/
    └── ui/
```

## Quick start: demo app

### Local

```bash
cd team-directory
npm run db:init
npm run api
```

In a second terminal:

```bash
cd team-directory
npm run ui
```

Open `http://localhost:3000`.

### Docker

```bash
cd team-directory
docker compose up --build
```

Open `http://localhost`.

### Validate

```bash
cd team-directory
npm run check
```

## Quick start: OpenClaw

1. Install and onboard OpenClaw first.
2. Run the bootstrap script:

```bash
cd openclaw
./setup.sh /absolute/path/to/claw-architecture
```

3. Merge `openclaw/agents-snippet.json` into your `~/.openclaw/openclaw.json` after onboarding.

Read `openclaw/README.md` for the exact flow.

## Blog

The publishable post lives here:

- `blog/claw-architecture-with-buildwright.md`

## License

MIT
