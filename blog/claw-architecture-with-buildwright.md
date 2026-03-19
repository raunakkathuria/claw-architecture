# Claw Architecture with OpenClaw and Buildwright

Most AI coding setups still assume one agent will read the whole repo, understand every layer, keep every naming rule in its head, and make safe changes across the stack in one go.

That can work for small edits. It starts to fray when a feature crosses boundaries.

Think about a request like this:

> Add profile photo upload for team members.

That single sentence can touch storage, routing, API contracts, validation rules, UI state, rendering, and reverse proxy configuration. A generalist agent can brute-force its way through it, but the failure modes are familiar:

- the database and API disagree on field names
- the UI assumes a response shape the backend never shipped
- the gateway is forgotten until the end
- one “quick fix” turns into a cross-layer regression hunt

I like a different mental model for this kind of work:

**one brain, multiple claws.**

The brain does decomposition and integration. Each claw owns one domain.

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

That is the core of what I call **Claw Architecture**.

This post walks through a version of that setup that is now honest and reproducible:

- a working demo app you can run locally
- an OpenClaw multi-agent workspace bootstrap
- an optional Buildwright layer if you want slash-command workflow automation

The important word is **optional**. That distinction matters.

## What OpenClaw does in this setup

OpenClaw is the runtime layer for the agents. It gives you isolated agent workspaces, separate memory, separate sessions, and routing so you can run multiple agents side by side instead of cramming every concern into one assistant.

In practical terms, that means you can keep:

- an architect workspace for orchestration notes and interface contracts
- a frontend workspace focused on UI work
- a backend workspace focused on the API and service logic
- a database workspace focused on schema and persistence

The key implementation detail is easy to miss: **the agent workspace is the default working directory**. If you want multiple agents to collaborate on the same repository, each isolated workspace still needs a clean path into that shared codebase.

The fixed setup in this repository handles that by creating a `project/` symlink inside every agent workspace that points back to the same checkout of this repository.

Each agent gets:

- a private workspace for notes and memory
- a shared `project/` entry that points to the same codebase

That keeps the “separate brains” part intact without breaking real collaboration.

## What Buildwright adds

Buildwright solves a different problem.

It is not the agent runtime. It is the **workflow layer**: research, spec generation, approval, implementation, verification, review, and shipping. If you install the full Buildwright project workflow in a repository, you get commands like:

- `/bw-analyse`
- `/bw-new-feature`
- `/bw-claw`
- `/bw-quick`
- `/bw-verify`
- `/bw-ship`

That is powerful, but it only exists after you install Buildwright properly in the project and sync the generated command files.

This repository now makes that distinction explicit:

- it **does** install the shared Buildwright skill as OpenClaw guidance
- it **does not** pretend the full `/bw-*` workflow is already installed in the repo

If you want the full command set, run Buildwright’s own project setup in this repository after cloning it.

## The demo app

The sample app is intentionally small, but it is a real runnable stack.

```
UI (static HTML/CSS/JS) -> Gateway (Nginx) -> API (Node.js) -> Database (SQLite)
```

Why this stack?

Because the point of the repository is not framework novelty. The point is a clean multi-layer target for agent coordination.

The app lives in `example/` and includes:

- a member list UI
- member create/delete flows
- a Node.js API with CRUD endpoints
- SQLite schema and seed data
- API tests and a smoke test
- an optional Nginx gateway for the “real stack” shape

There is no hidden “trust me” step anymore.

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

## Run the demo locally

The local developer path is intentionally simple and does not require `npm install` because the demo uses the Node.js runtime plus built-in SQLite support.

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

To validate the demo:

```bash
npm run check
```

That runs the automated API tests and a smoke test.

## Run the demo with Docker

If you want the full UI -> gateway -> API shape, use Docker Compose:

```bash
cd example
docker compose up --build
```

Open `http://localhost`.

The gateway currently proxies only the UI and API. It does **not** pre-configure an `/uploads/` route. That is deliberate, because it keeps the future “profile photo upload” example honest: adding file serving really would require a gateway change.

## Setting up OpenClaw for the claw model

The OpenClaw part of this repo is now framed as a bootstrap, not a magic full install.

### Step 1: onboard OpenClaw first

Do the normal OpenClaw onboarding first so your base config, gateway, provider auth, and optional channels are already in place.

### Step 2: bootstrap the workspaces

From this repository:

```bash
cd openclaw
./setup.sh /absolute/path/to/claw-architecture
```

The script now does four concrete things:

1. installs the shared Buildwright skill to `~/.openclaw/skills/buildwright/SKILL.md`
2. creates isolated workspaces for architect, frontend, backend, and database agents
3. copies the agent-specific `AGENTS.md` instructions into each workspace
4. creates a shared `project/` symlink in each workspace pointing back to this repository

That shared `project/` link is the difference between a nice diagram and a usable setup.

### Step 3: merge the agent snippet

The file `openclaw/agents-snippet.json` is intentionally just a snippet. Merge it into your `~/.openclaw/openclaw.json` after onboarding instead of replacing your entire config.

The snippet defines the extra agents and points each one at its own workspace. It does not try to overwrite your existing provider, gateway, or channel settings. It also does not force a new default agent, so you can decide whether the architect should become your default or only be used via explicit targeting or bindings.

### Step 4: optionally install full Buildwright in the repo

If you want Buildwright’s slash commands in this repository, install the official project workflow here too:

```bash
curl -sL https://raw.githubusercontent.com/raunakkathuria/buildwright/main/setup.sh | bash
make sync
```

After that, the repo can support the `/bw-*` command layer in the way Buildwright documents.

Without that project-level install, you still have the shared Buildwright skill as guidance plus the OpenClaw workspaces, but you should not market the repo as if `/bw-claw` already exists out of the box.

## A feature that benefits from claws

Let’s go back to the example:

> Add profile photo upload for team members.

In this repo, that request is intentionally cross-cutting.

| Layer | Likely change |
| --- | --- |
| Database | add a `photo_url` column or a related asset table |
| API | accept upload metadata or file handling and return `photoUrl` |
| Gateway | expose uploaded files under a public route |
| UI | add upload controls and render member photos |

That is exactly where a claw-style decomposition helps.

### Architect agent

The architect should answer the cross-layer questions first:

- Where will files live?
- Is the public URL absolute or relative?
- Is the API storing binary files, file paths, or both?
- What is the canonical field mapping across DB, API, and UI?
- What validation rules should every claw share?

Then the architect writes down the interface contract and delegates the layer work.

### Database claw

The database claw owns the persistence decision and naming discipline.

Example concern set:

- `photo_url` in SQLite
- nullable for existing rows
- migration/seed impact
- backward compatibility for current reads

### API claw

The API claw owns the contract.

Example concern set:

- request and response shape
- validation rules
- where the file is stored
- how the public URL is generated
- whether existing member endpoints expand to include `photoUrl`

### UI claw

The UI claw owns interaction and rendering.

Example concern set:

- upload input state
- empty-state avatar fallback
- optimistic vs confirmed update
- display size and crop rules
- error handling

### Integration pass

The architect pulls the work back together and runs the project checks.

In this demo repo, that means running the actual project validation that exists today:

```bash
cd project/example
npm run check
```

Not “security scan, lint, code review, and PR shipped” unless the full Buildwright workflow has been installed.

## What the fixed agent docs now do

Each agent workspace in `openclaw/workspace-*/` now points at the real file tree and the real validation command.

The architect instructions tell the agent to:

- work from `project/example/`
- write interface notes in its private workspace
- delegate by domain
- run `npm run check` at integration time

The frontend, backend, and database instructions each scope the agent to the files it should primarily touch.

That gives you separation without pretending the agents are trapped in perfect sandboxes.

## Why I still like this pattern

The real value is not “more agents = better.”

The real value is this:

- the architect carries system intent
- the claws carry domain context
- shared naming rules are explicit
- the repository path is the same for every claw
- integration is a deliberate step instead of an accident

In other words, the architecture turns one fuzzy prompt into a small coordination problem.

That is a better place to be.

## What this repository now guarantees

This is the part I care about most, because it is where demo repositories usually get slippery.

This repository now guarantees:

- the blog matches the code
- the demo app runs locally
- the non-Docker flow is correct
- the Docker flow is coherent
- the OpenClaw setup script fetches the correct Buildwright skill path
- the agent workspaces have a real shared path back to the repo
- the instructions no longer claim commands or quality gates that are not actually present

That makes it useful both as a publishable post and as a starting point for a real experiment.

## Final note

I do not think every project needs multi-agent orchestration.

But when a feature genuinely spans database, API, UI, and edge routing, I would rather have:

- one agent responsible for decomposition
- several agents responsible for domain execution
- one explicit integration step

than a single overconfident agent improvising across the whole stack.

That is Claw Architecture in one sentence:

**one brain, multiple claws, shared contracts, deliberate integration.**
