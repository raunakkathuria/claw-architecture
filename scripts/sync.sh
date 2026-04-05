#!/usr/bin/env bash
# ================================================================
# sync.sh — Sync OpenClaw runtime state back to this repo
# ================================================================
# Usage:
#   ./scripts/sync.sh              # sync all agents + config
#   ./scripts/sync.sh architect    # sync one agent only
#   ./scripts/sync.sh --dry-run    # preview without writing
#   ./scripts/sync.sh --no-push    # commit but don't push
#
# What it does:
#   1. Syncs agent workspaces → openclaw/workspace-*/
#      (skips runtime-only dirs: .openclaw/, sessions/)
#   2. git add -A && git commit && git push
#
# Safe to run as a cron job. Exits cleanly if nothing changed.
# ================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPENCLAW_HOME="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
AGENTS_SRC="$OPENCLAW_HOME"
AGENTS_DEST="$REPO_ROOT/openclaw"

DRY_RUN=false
NO_PUSH=false
TARGET_AGENT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --no-push) NO_PUSH=true; shift ;;
    --help|-h)
      echo "Usage: $0 [--dry-run] [--no-push] [agent-id]"
      exit 0
      ;;
    *) TARGET_AGENT="$1"; shift ;;
  esac
done

log()  { echo "[sync] $*"; }
warn() { echo "[sync] ⚠️  $*" >&2; }

sync_agent() {
  local agent_id="$1"
  local src="$AGENTS_SRC/workspace-$agent_id"
  local dest="$AGENTS_DEST/workspace-$agent_id"

  if [[ ! -d "$src" ]]; then
    warn "Workspace not found: $src (skipping)"
    return 0
  fi

  if [[ ! -d "$dest" ]]; then
    warn "Agent not in repo: $dest (skipping — use setup.sh to add new agents)"
    return 0
  fi

  log "Syncing agent: $agent_id"

  if $DRY_RUN; then
    log "  [DRY RUN] Would rsync $src/ → $dest/"
    return
  fi

  # Sync workspace files back to repo.
  # Excludes:
  #   - .openclaw/    (session runtime state)
  #   - skills/       (deployed FROM repo, not managed here)
  #   - project/      (symlink to repo root, not a real dir)
  #   - notes/        (optional: comment out if you want notes synced)
  rsync -a \
    --exclude='.openclaw/' \
    --exclude='skills/' \
    --exclude='project' \
    --exclude='.DS_Store' \
    --exclude='*.pyc' \
    --exclude='__pycache__/' \
    "$src/" "$dest/"

  log "  ✅ $agent_id synced"
}

git_sync() {
  cd "$REPO_ROOT"

  if git diff --quiet && git diff --staged --quiet; then
    log "Nothing to commit — repo is up to date"
    return 0
  fi

  local timestamp
  timestamp=$(date "+%Y-%m-%d %H:%M")
  local commit_msg="sync: $timestamp"

  if $DRY_RUN; then
    log "[DRY RUN] Would commit: $commit_msg"
    git status --short
    return
  fi

  git add -A
  git commit -m "$commit_msg"
  log "✅ Committed: $commit_msg"

  if $NO_PUSH; then
    log "Skipping push (--no-push)"
  else
    git push
    log "✅ Pushed to remote"
  fi
}

main() {
  log "OpenClaw Sync — runtime → repo"
  log "Repo:     $REPO_ROOT"
  log "OpenClaw: $OPENCLAW_HOME"
  log "Dry run:  $DRY_RUN"
  echo ""

  if [[ -n "$TARGET_AGENT" ]]; then
    sync_agent "$TARGET_AGENT"
  else
    for ws_dir in "$AGENTS_DEST"/workspace-*/; do
      [[ -d "$ws_dir" ]] || continue
      agent_id="${ws_dir##*workspace-}"
      agent_id="${agent_id%/}"
      sync_agent "$agent_id"
    done
  fi

  echo ""
  git_sync
  echo ""
  log "Done."
}

main "$@"
