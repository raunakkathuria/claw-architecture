# Claw Architecture with OpenClaw and Buildwright

The request came in clean: *Add profile photo upload for team members.*

One sentence. The kind of thing you'd schedule for a Tuesday afternoon.

The agent started. And then the familiar unravelling: the API returned `photo_url`. The UI was reading `photoUrl`. The gateway had no route for uploaded files because nobody thought to mention it. The database added the column but the migration broke the existing seed. Four changes, four layers, four places where the assumption was slightly off — all of them invisible until everything came back together.

That's not an agent failure. That's what happens when you ask one thing to carry context for an entire stack.

I've been running a different model. One brain that coordinates. Multiple claws that each own one domain. The brain doesn't try to hold the whole stack in memory — it writes down the interface contracts and delegates. Each claw reads the contract, does its part, hands the work back.

```
                         Brain
                    (architect agent)
                           |
           ---------------------------------------
           |                  |                  |
           v                  v                  v
        UI claw           API claw            DB claw
      presentation       contracts           schema/data
```

I call it **Claw Architecture**.

This post walks through a working implementation: a runnable demo app, an OpenClaw workspace bootstrap that sets up the multi-agent model, and an optional Buildwright layer for slash-command workflow automation. Optional is the important word. I'll come back to that.

## What OpenClaw does in this setup

OpenClaw's multi-agent model is workspace routing. Each agent gets its own isolated workspace — separate memory, separate sessions, separate working directory, separate auth profiles. They run side by side on one gateway without bleeding into each other.

The real setup I'm running looks like this:

```
~/.openclaw/
├── workspace-iraunak/              ← personal assistant
├── workspace-content-personal/     ← content agent (this post)
├── workspace-content-lexilint/     ← LexiLint product agent
├── workspace-content-illyetlogical/← ill-yet-logical persona
├── workspace-content-technical-book/
└── workspace-content-leadership-book/
```

Each workspace is registered in `~/.openclaw/openclaw.json` under `agents.list`, and routed by channel binding — each agent has its own Telegram bot, its own account, its own conversation thread:

```json
{
  "agents": {
    "list": [
      { "id": "iraunak",           "workspace": "~/.openclaw/workspace-iraunak" },
      { "id": "content-personal",  "workspace": "~/.openclaw/workspace-content-personal" },
      { "id": "content-lexilint",  "workspace": "~/.openclaw/workspace-content-lexilint" }
    ]
  },
  "bindings": [
    { "agentId": "content-personal", "match": { "channel": "telegram", "accountId": "content-personal" } },
    { "agentId": "iraunak",          "match": { "channel": "telegram", "accountId": "iraunak" } }
  ]
}
```

Inbound messages route to the right agent. Each agent carries its own `AGENTS.md`, `SOUL.md`, `USER.md`, skills, and memory. No shared state unless you explicitly wire it.

For the claw-architecture repo specifically, each agent workspace also has a `project/` symlink pointing back to the shared repository checkout — so the architect, frontend, backend, and database claws all work on the same codebase from their own isolated context.

Same files, different brains.

## What Buildwright adds

Buildwright solves a different problem. It's not the runtime — it's the **workflow layer**: research, spec generation, approval gates, implementation, verification, review, shipping. There's also a pure research mode (`/bw-plan`) for analysis that shouldn't touch code at all.

Install the full Buildwright project workflow and you get commands like `/bw-analyse`, `/bw-new-feature`, `/bw-claw`, `/bw-quick`, `/bw-verify`, `/bw-ship`.

This repository installs the shared Buildwright skill as OpenClaw guidance. It does **not** include the full `/bw-*` command set out of the box — that only lands after you run Buildwright's own project setup. I kept the distinction explicit because conflating them caused me real confusion early on. The skill gives the agent knowledge of the concepts. The project install gives you the actual commands.

## The demo app

The sample app is intentionally small. Framework novelty isn't the point — a clean multi-layer target for agent coordination is.

```
UI (static HTML/CSS/JS) -> Gateway (Nginx) -> API (Node.js) -> Database (SQLite)
```

No `npm install` required. It runs on the Node.js runtime with built-in SQLite support.

```bash
cd example
npm run db:init
npm run api
# second terminal:
npm run ui
```

Open `http://localhost:3000`. Run `npm run check` to validate. For the full UI → gateway → API shape:

```bash
cd example
docker compose up --build
```

Open `http://localhost`. One deliberate gap: the gateway doesn't pre-configure an `/uploads/` route. Adding file serving really does require a gateway change — keeping that honest was the point of the gap.

## Repository structure

```
claw-architecture/
├── blog/
│   └── claw-architecture-with-buildwright.md
├── openclaw/
│   ├── README.md
│   ├── setup.sh
│   ├── agents-snippet.json
│   └── workspace-*/
└── example/
    ├── api/
    ├── database/
    ├── gateway/
    ├── scripts/
    ├── tests/
    └── ui/
```

## Setting up OpenClaw for the claw model

The OpenClaw part is a bootstrap, not a full install.

**Step 1:** Do normal OpenClaw onboarding first — base config, gateway, provider auth, optional channels. Don't skip this.

**Step 2:** From this repository:

```bash
cd openclaw
./setup.sh /absolute/path/to/claw-architecture
```

The script does four things:

1. installs the shared Buildwright skill to `~/.openclaw/skills/buildwright/SKILL.md`
2. creates isolated workspaces for architect, frontend, backend, and database agents
3. copies the agent-specific `AGENTS.md` and supporting files into each workspace
4. creates a `project/` symlink in each workspace pointing back to this repository

**Step 3:** Merge `openclaw/agents-snippet.json` into your `~/.openclaw/openclaw.json`. It's a snippet, not a replacement — it registers each agent with its workspace path without touching your existing provider, gateway, or channel config.

Alternatively, use the agent wizard:

```bash
openclaw agents add architect
openclaw agents add frontend
openclaw agents add backend
openclaw agents add database
```

Verify the routing is wired correctly:

```bash
openclaw agents list --bindings
```

**Step 4 (optional):** For the `/bw-*` commands:

```bash
curl -sL https://raw.githubusercontent.com/raunakkathuria/buildwright/main/setup.sh | bash
make sync
```

Without that, you still have the Buildwright skill plus the OpenClaw workspaces — which is a working setup on its own.

**Keeping the repo in sync:** The `scripts/sync.sh` script handles the reverse flow — runtime back to repo. It rsyncs each agent workspace into `openclaw/workspace-*/` and commits. Safe to run as a cron job.

```bash
./scripts/sync.sh              # sync all agents + config
./scripts/sync.sh architect  # sync one agent
./scripts/sync.sh --dry-run    # preview without writing
```

That's how the repo stays as a living record of your actual setup, not just a starting point you forked and forgot.

## A feature that benefits from claws

Back to the photo upload request. You know the one.

| Layer | Likely change |
|-------|---------------|
| Database | add a `photo_url` column or a related asset table |
| API | accept upload metadata or file handling, return `photoUrl` |
| Gateway | expose uploaded files under a public route |
| UI | add upload controls, render member photos |

This is where the claw decomposition earns its keep.

**Architect agent** answers the cross-layer questions first. Where do files live? Is the public URL absolute or relative? Is the API storing binary files, file paths, or both? What's the canonical field name — `photo_url` or `photoUrl`? Write the interface contract. Delegate.

**Database claw** owns the persistence decision. `photo_url` in SQLite, nullable for existing rows, migration impact, backward compatibility for current reads.

**API claw** owns the contract. Request and response shape, validation, how the public URL is generated, whether existing member endpoints expand to include the new field.

**UI claw** owns interaction. Upload input state, empty-state avatar fallback, optimistic vs confirmed update, display size, crop rules, error handling.

**Integration pass:** the architect agent runs the check from inside its workspace, where `project/` points at the shared codebase:

```bash
cd project/example
npm run check
```

The `photo_url` vs `photoUrl` disagreement from the opening — that's exactly the thing the architect's interface contract is meant to catch before it costs anyone two hours. Write the field name down once. Every claw reads the same document.

## Why this works

More agents that don't coordinate isn't better. It's just more confusion spread across more processes.

What the claw model gives you:

- the architect carries system intent across the whole feature
- each claw carries domain context without being distracted by the rest
- naming and contract decisions are written down, not assumed
- the repository path is shared — same codebase, different entry points
- integration is explicit, not accidental

That's what turns "add profile photo upload" into a tractable coordination problem instead of a cross-layer regression at 2am.

## What this repository guarantees

The blog matches the code. The demo runs locally with no install step. The Docker flow is coherent. The setup script installs the Buildwright skill and wires the shared project path correctly. The agent workspaces have a real path back to the repo. Every command mentioned in this post exists and runs.

Useful as a reference. Useful as a starting point for a real experiment.

---

I don't think every project needs this. A small feature that touches one layer is fine with one agent.

But when a request genuinely spans database, API, UI, and edge routing — and the failure mode is four layers silently disagreeing about a field name — I'd rather have one agent doing decomposition, several doing domain execution, and one deliberate integration step.

**One brain. Multiple claws. Shared contracts. Deliberate integration.**
