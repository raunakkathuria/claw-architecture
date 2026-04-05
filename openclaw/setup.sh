#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${1:-$(cd "${SCRIPT_DIR}/.." && pwd)}"
OPENCLAW_DIR="${HOME}/.openclaw"
BUILDWRIGHT_URL="https://raw.githubusercontent.com/raunakkathuria/buildwright/main/SKILL.md"
LOCAL_SKILL="${SCRIPT_DIR}/vendor/buildwright/SKILL.md"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd ln
require_cmd mkdir
require_cmd cp

if [ ! -d "${REPO_ROOT}" ]; then
  echo "Repository path does not exist: ${REPO_ROOT}" >&2
  exit 1
fi

echo "Setting up Claw Architecture OpenClaw workspaces..."
echo "Repository root: ${REPO_ROOT}"

mkdir -p "${OPENCLAW_DIR}/skills/buildwright"
if curl -fsSL "${BUILDWRIGHT_URL}" -o "${OPENCLAW_DIR}/skills/buildwright/SKILL.md"; then
  echo "Installed shared Buildwright skill from GitHub: ${OPENCLAW_DIR}/skills/buildwright/SKILL.md"
else
  cp "${LOCAL_SKILL}" "${OPENCLAW_DIR}/skills/buildwright/SKILL.md"
  echo "GitHub download unavailable. Installed vendored Buildwright skill: ${OPENCLAW_DIR}/skills/buildwright/SKILL.md"
fi

for ws in architect frontend backend database; do
  WS_DIR="${OPENCLAW_DIR}/workspace-${ws}"
  mkdir -p "${WS_DIR}/notes"

  rm -f "${WS_DIR}/project"
  ln -s "${REPO_ROOT}" "${WS_DIR}/project"
done

cp "${SCRIPT_DIR}/workspace-architect/AGENTS.md" "${OPENCLAW_DIR}/workspace-architect/AGENTS.md"
cp "${SCRIPT_DIR}/workspace-architect/architecture.md" "${OPENCLAW_DIR}/workspace-architect/architecture.md"
cp "${SCRIPT_DIR}/workspace-architect/naming-conventions.md" "${OPENCLAW_DIR}/workspace-architect/naming-conventions.md"
cp "${SCRIPT_DIR}/workspace-frontend/AGENTS.md" "${OPENCLAW_DIR}/workspace-frontend/AGENTS.md"
cp "${SCRIPT_DIR}/workspace-backend/AGENTS.md" "${OPENCLAW_DIR}/workspace-backend/AGENTS.md"
cp "${SCRIPT_DIR}/workspace-database/AGENTS.md" "${OPENCLAW_DIR}/workspace-database/AGENTS.md"

cat <<EOF

Workspace bootstrap complete.

Next steps:
  1. Run OpenClaw onboarding if you have not already:
     openclaw onboard --install-daemon

  2. Merge the agent snippet into your existing config:
     ${SCRIPT_DIR}/agents-snippet.json

     Or use the agent wizard:
     openclaw agents add architect
     openclaw agents add frontend
     openclaw agents add backend
     openclaw agents add database

  3. Verify routing is wired correctly:
     openclaw agents list --bindings

  4. Optional: install full Buildwright project workflow in the repo root:
     curl -sL https://raw.githubusercontent.com/raunakkathuria/buildwright/main/setup.sh | bash
     make sync

  5. To keep this repo in sync with your runtime state, run:
     ./scripts/sync.sh

Each workspace now contains:
  ~/.openclaw/workspace-architect/project  -> ${REPO_ROOT}
  ~/.openclaw/workspace-frontend/project   -> ${REPO_ROOT}
  ~/.openclaw/workspace-backend/project    -> ${REPO_ROOT}
  ~/.openclaw/workspace-database/project   -> ${REPO_ROOT}

Shared Buildwright skill:
  ~/.openclaw/skills/buildwright/SKILL.md

See openclaw/README.md for the full walkthrough.
EOF
