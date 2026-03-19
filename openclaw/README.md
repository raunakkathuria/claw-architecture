# OpenClaw bootstrap for Claw Architecture

This directory bootstraps a **multi-agent workspace layout** for the repository. It does not replace the normal OpenClaw onboarding flow.

## What this setup does

- creates isolated workspaces for `architect`, `frontend`, `backend`, and `database`
- copies agent-specific `AGENTS.md` instructions into each workspace
- creates a shared `project/` symlink in every workspace that points to this repository
- installs the shared Buildwright skill at `~/.openclaw/skills/buildwright/SKILL.md`

## What this setup does not do

- it does not run `openclaw onboard` for you
- it does not overwrite your entire `~/.openclaw/openclaw.json`
- it does not install the full Buildwright project workflow in this repo

## Recommended flow

### 1. Onboard OpenClaw first

Use the normal OpenClaw onboarding flow so your provider auth, gateway settings, and channel config already exist.

### 2. Run the workspace bootstrap

```bash
cd openclaw
./setup.sh /absolute/path/to/claw-architecture
```

If you omit the path, the script assumes the repository root is the parent directory of `openclaw/`.

### 3. Merge the agent snippet

Merge `agents-snippet.json` into your existing `~/.openclaw/openclaw.json` after onboarding.

**Important:** The snippet uses `/your/home` as a placeholder. Replace it with your actual home directory absolute path before merging (e.g. `/Users/yourname` on macOS or `/home/yourname` on Linux). OpenClaw does not expand `~` in workspace paths.

The snippet only defines extra agents and their workspaces. Keep your existing provider, gateway, and channel settings from onboarding. It also avoids forcing a new default agent, so you can decide whether the architect should become your default or only be used via explicit targeting or bindings.

### 4. Optional: install the full Buildwright workflow in the repo

If you want Buildwright slash commands such as `/bw-claw` in this repository, run Buildwright's project setup from the repo root:

```bash
curl -sL https://raw.githubusercontent.com/raunakkathuria/buildwright/main/setup.sh | bash
make sync
```

Without that step, OpenClaw will still see the shared Buildwright skill, but the full project command layer will not exist yet.

## Example direct usage

Once the agents are configured, you can target them directly.

```bash
openclaw agent --agent architect --message "Review project/example and plan the profile photo upload feature"
openclaw agent --agent database --message "Propose the schema change for member profile photos in project/example"
openclaw agent --agent backend --message "Review the API changes needed for profile photo upload in project/example"
openclaw agent --agent frontend --message "Review the UI work needed for profile photo upload in project/example"
```

## Files

- `setup.sh` - bootstraps workspaces and shared skill
- `agents-snippet.json` - sample agent config fragment
- `workspace-*/AGENTS.md` - per-agent instructions
