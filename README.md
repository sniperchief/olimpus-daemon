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

## Critical gotcha: always log in as `appuser`, never as root

`railway ssh` drops you into the container as **root**. The daemon itself runs as the
unprivileged `appuser` (see Dockerfile — Claude Code refuses to run under root). This
matters a lot for `onchainos wallet login`: **onchainos encrypts its session/keyring with
a key tied to the specific OS user that logged in** — not just file ownership. A login
run as root produces a `keyring.enc` that root can decrypt but `appuser` cannot, even
though `appuser` owns the file and can read its raw bytes. The daemon will then fail
every API call with a generic `"session expired, please login again"` error — which is
misleading, since the session is fine, it's just undecryptable by the user that actually
needs it.

**Always run the login explicitly as `appuser`**, e.g.:

```
gosu appuser onchainos wallet login --phase init
# open the printed URL, log in with the correct email
gosu appuser onchainos wallet login --phase poll
```

Never run a bare `onchainos wallet login ...` in an SSH session without `gosu appuser`
in front of it — it will "succeed" and silently produce a session the daemon can't use.
