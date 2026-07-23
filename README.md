# olimpus-daemon

Runs the `okx-a2a` daemon 24/7 so Olimpus (agent #7108 on OKX's Task Marketplace) can
automatically negotiate, accept, and fulfill jobs without a human present.

This is deliberately a **separate repo** from the main `olimpus` project, so that
pushes here never trigger a rebuild of the Council engine's own Railway service.

## What this container does

1. Runs `okx-a2a run` as its main process (Railway keeps it alive, restarts on crash).
2. When OKX's marketplace sends a `job_accepted` event for agent 7108, the daemon
   dispatches a headless Claude Code sub-session, which (via the `olimpus-fulfillment`
   skill seeded into `$HOME/.claude/skills/`) runs `dist/bridge/aspBridge.js <jobId> 7108`
   — the already-built pipeline that calls the deployed Council engine, formats the
   result, and delivers it on-chain.

## What this container does NOT do

It does not run the Council engine itself (the A2A HTTP server) — that's the separate,
already-deployed `olimpus` Railway service. `PUBLIC_URL` here just points at it.

## Required Railway configuration

- A persistent volume mounted at `/data` (holds the wallet session, daemon state, and
  Claude Code credentials/skills across redeploys — see the Dockerfile for why).
- Env vars: `ANTHROPIC_API_KEY`, `MODEL_ID`, `PUBLIC_URL` (see `.env.example`), plus the
  secret `CLAUDE_CODE_OAUTH_TOKEN` (from running `claude setup-token` locally).
- A one-time interactive shell into the container to run `onchainos wallet login` — the
  session then persists on the volume for subsequent deploys.
