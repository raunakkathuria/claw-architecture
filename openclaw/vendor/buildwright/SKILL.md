---
name: buildwright
description: Autonomous development workflow with multi-agent Claw Architecture. Single-agent mode for simple features; multi-agent mode decomposes cross-domain work into specialist claws (UI, API, DB). Includes TDD, security scan, code review, and quality gates. Works with Claude Code, OpenCode, OpenClaw, and Cursor.
license: MIT
compatibility: Requires git and gh (GitHub CLI). GITHUB_TOKEN with repo scope needed for push/PR.
metadata:
  homepage: https://github.com/raunakkathuria/buildwright
  version: "0.0.5"
  author: raunakkathuria
  tags:
    - development
    - workflow
    - tdd
    - security
    - code-review
    - autonomous
    - multi-agent
    - claw-architecture
openclaw:
  requires:
    bins:
      - git
      - gh
    env:
      - GITHUB_TOKEN
    primaryEnv: GITHUB_TOKEN
---

# Buildwright

Spec-driven autonomous development.

Humans approve intent; agents handle everything else.

## What this skill does

When activated, Buildwright directs the agent to:
1. Read your codebase and steering documents
2. Write a one-page spec (`docs/specs/[feature]/spec.md`)
3. Stop for human approval unless `BUILDWRIGHT_AUTO_APPROVE=true`
4. Implement the feature with TDD
5. Run quality gates: typecheck, lint, test, build
6. Run optional security scans if `semgrep`, `gitleaks`, or `trufflehog` are installed
7. Run a Staff Engineer prompt-based code review
8. Commit, push, and open a PR via `gh`

## Requirements

### Credentials

- `GITHUB_TOKEN` with `repo` scope for push and PR creation

### Binaries

- `git`
- `gh`

### Optional tools

- `semgrep`
- `gitleaks`
- `trufflehog`

## Commands

- `/bw-new-feature` - research, spec, approval, build, verify, review, and PR
- `/bw-claw` - multi-agent Claw Architecture workflow for cross-domain features
- `/bw-quick` - fast path for small tasks and bug fixes
- `/bw-ship` - verify, security, review, push, and PR
- `/bw-verify` - typecheck, lint, test, build
- `/bw-analyse` - analyse the codebase and write docs into `.buildwright/codebase/`
- `/bw-help` - show available commands

## First-use advice

- Start in interactive mode and leave `BUILDWRIGHT_AUTO_APPROVE` unset
- Use a sandbox repository first
- Review generated PRs before merging
- Install the full project workflow if you want slash commands in the repo

## More information

Full documentation and setup instructions:
https://github.com/raunakkathuria/buildwright
