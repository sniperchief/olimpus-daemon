---
name: olimpus-fulfillment
description: >
  Olimpus-specific OKX ASP fulfillment hook. Use this whenever handling a job_accepted system
  event, a next-action deliver step, or any a2a-agent-chat/task-asp flow where the target/receiving
  agentId is 7108 (the "Olimpus" ASP identity, service "The Olimpian Council", an AI startup-studio
  agent). Tells you to run the already-built aspBridge.js fulfillment script instead of manually
  generating the deliverable or calling agent deliver yourself.
---

# Olimpus ASP Fulfillment Hook

Loaded when: handling a `job_accepted` system event (or reaching the "deliver" step of `task-asp.md`) for OKX Task Marketplace **agentId 7108** — the "Olimpus" ASP identity, service "The Olimpian Council". Also matches any a2a-agent-chat or next-action flow where the receiving/target agentId is `7108`.

## Action (do this instead of manually generating or delivering the work)

Do **not** manually call `onchainos agent deliver` for this agent, and do **not** try to write the Startup Workspace content yourself. Instead, run exactly this command:

```
cd /app && ANTHROPIC_API_KEY="$BRIDGE_ANTHROPIC_API_KEY" node dist/bridge/aspBridge.js <jobId> 7108
```

Substitute `<jobId>` with the actual jobId from the triggering event.

🛑 **Always prefix with `ANTHROPIC_API_KEY="$BRIDGE_ANTHROPIC_API_KEY"` exactly as shown — never run the bare `node dist/bridge/aspBridge.js ...` without it, and never export `ANTHROPIC_API_KEY` more broadly than this one command.** The bridge itself needs a real Anthropic API key for one internal call (parsing the founder's raw task text via Haiku) — that key is intentionally stored under the separate name `BRIDGE_ANTHROPIC_API_KEY` in this container's environment, specifically so it is invisible to your own (Claude Code CLI's) auth resolution. If `ANTHROPIC_API_KEY` were set in the general environment instead, Claude Code CLI would pick it up for its own billing instead of your subscription auth — reintroducing real metered-dollar costs on every dispatch, not just this one bridge call.

🛑 **Run this in the FOREGROUND — never with `run_in_background: true` or any other backgrounding mechanism.** This dispatch is a single, one-shot CLI invocation (`okx-a2a ai exec`), not a persistent session — when this turn ends, the whole process exits, and anything launched in the background is killed with it, before it can possibly finish. The bridge takes several minutes (it runs the full 7-persona Council pipeline); you must block and wait for it to exit on its own within this same turn, however long that takes. Do not end the turn, do not report a result, and do not treat "it's still running" as done until the foreground command itself returns.

This script is the complete, already-built fulfillment pipeline for Olimpus:
1. Fetches the task context via `onchainos agent common context`.
2. Extracts the founder's input (idea / target audience / primary goal).
3. Calls the deployed Olimpus Council engine (a separate A2A server on Railway) via `message/send`, and polls `tasks/get` until the 7-persona reviewed pipeline completes (this can take several minutes).
4. Formats the completed result into a Startup Workspace markdown document.
5. Calls `onchainos agent deliver` itself with that file.
6. On any failure, it calls `onchainos agent mark-failed` itself — do not do this manually in its place.

Run the command in the foreground, wait for it to actually exit, and report its output (success or failure) — do not duplicate any of its steps by hand, and do not run `agent deliver` yourself before or after it runs.

## Scope

This skill only concerns **fulfillment after `job_accepted`** for agentId 7108. Negotiation, designation, and `apply` are still handled by the normal `okx-ai` skill's `task-asp.md` / `task-asp-accept.md` flow — this hook does not change any of that.
