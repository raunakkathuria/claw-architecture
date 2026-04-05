# OpenClaw bootstrap for Claw Architecture

This directory bootstraps a **multi-agent workspace layout** for the repository. It does not replace the normal OpenClaw onboarding flow.

## How OpenClaw multi-agent routing works

OpenClaw's multi-agent model is workspace routing. Each agent gets its own isolated workspace — separate memory, separate sessions, separate working directory. Multiple agents run on one gateway, routed to the right agent based on channel bindings.

On disk, that looks like:

```
~/.openclaw/
├── workspace-architect/   ← architect agent
├── workspace-frontend/    ← UI claw
├── workspace-backend/     ← API claw
└── workspace-database/    ← DB claw
```

In config, each agent registers its workspace and binds to an inbound channel account:

```json
{
  "agents": {
    "list": [
      { "id": "architect", "workspace": "~/.openclaw/workspace-architect" },
      { "id": "frontend",  "workspace": "~/.openclaw/workspace-frontend" }
    ]
  },
  "bindings": [
    { "agentId": "architect", "match": { "channel": "telegram", "accountId": "architect" } },
    { "agentId": "frontend",  "match": { "channel": "telegram", "accountId": "frontend" } }
  ]
}
```

See [docs.openclaw.ai/concepts/multi-agent](https://docs.openclaw.ai/concepts/multi-agent) for the full reference.

## What this setup does

- creates isolated workspaces for `architect`, `frontend`, `backend`, and `database`
- copies agent-specific `AGENTS.md` instructions into each workspace
- creates a shared `project/` symlink in every workspace pointing to this repository
- installs the shared Buildwright skill at `~/.openclaw/skills/buildwright/SKILL.md`

## What this setup does not do

- it does not run `openclaw onboard` for you
- it does not overwrite your entire `~/.openclaw/openclaw.json`
- it does not install the full Buildwright project workflow in this repo

## Recommended flow

### 1. Onboard OpenClaw first

Use the normal OpenClaw onboarding so your provider auth, gateway, and channel config already exist.

### 2. Run the workspace bootstrap

```bash
cd openclaw
./setup.sh /absolute/path/to/claw-architecture
```

If you omit the path, the script assumes the repository root is the parent directory of `openclaw/`.

### 3. Merge the agent snippet

Merge `agents-snippet.json` into your existing `~/.openclaw/openclaw.json`.

The snippet includes both `agents.list` entries (with workspace paths) and `bindings` (to route inbound messages to each agent). Replace `/your/home` with your actual home directory path.

Keep your existing provider, gateway, and channel settings — the snippet only adds what's new.

Or use the agent wizard:

```bash
openclaw agents add architect
openclaw agents add frontend
openclaw agents add backend
openclaw agents add database
```

Verify routing is wired:

```bash
openclaw agents list --bindings
```

### 4. Optional: install the full Buildwright workflow

```bash
curl -sL https://raw.githubusercontent.com/raunakkathuria/buildwright/main/setup.sh | bash
make sync
```

Without this, OpenClaw will still see the shared Buildwright skill — but the full `/bw-*` command layer won't exist yet.

## Keeping the repo in sync

Once you're running, use `scripts/sync.sh` to sync your runtime state back to the repo:

```bash
./scripts/sync.sh              # sync all agents
./scripts/sync.sh architect    # sync one agent
./scripts/sync.sh --dry-run    # preview without writing
./scripts/sync.sh --no-push    # commit but don't push
```

It rsyncs each agent workspace into `openclaw/workspace-*/`, skipping runtime-only paths (sessions, `.openclaw/`), and commits. Safe to run as a cron job.

## Files

- `setup.sh` — bootstraps workspaces and shared skill
- `agents-snippet.json` — agent config fragment with bindings (merge into openclaw.json)
- `workspace-*/AGENTS.md` — per-agent instructions
- `../scripts/sync.sh` — sync runtime state back to this repo
