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

Do **not** manually call `onchainos agent deliver` for this agent, and do **not** try to write the Startup Workspace content yourself.

**Step 1 — fetch the task context** (skip this if you already have it fresh from this same turn):

```
onchainos agent common context <jobId> --role asp --agent-id 7108
```

**Step 2 — extract the founder's input yourself** from that raw context, as a compact JSON object with this exact shape: `{"idea": "...", "targetAudience": "...", "primaryGoal": "..."}` (`targetAudience` is optional — omit the key if the task text doesn't mention one; `idea` and `primaryGoal` are required — infer a reasonable `primaryGoal` like "launch an MVP and validate product-market fit" if the founder didn't state one explicitly).

**Step 3 — run the bridge with that JSON as the third argument:**

```
cd /app && node dist/bridge/aspBridge.js <jobId> 7108 '<founderInputJson>'
```

(On the production host this is a Linux container with `WORKDIR /app`; adjust the path only if running somewhere the repo genuinely lives elsewhere.)

🛑 **The bridge takes the founder input as a CLI argument and does not call any LLM itself — it needs no Anthropic API key of its own, and none is configured in this environment.** Do not add `ANTHROPIC_API_KEY` back to the environment to "help" the bridge; it doesn't use one, and setting it would make Claude Code CLI's own dispatch billing pick it up instead of your subscription auth, reintroducing real metered costs.

Substitute `<jobId>` with the actual jobId from the triggering event, and `<founderInputJson>` with the JSON object from Step 2 (single-quoted so the shell passes it through as one argument).

🛑 **Run this in the FOREGROUND — never with `run_in_background: true` or any other backgrounding mechanism.** This dispatch is a single, one-shot CLI invocation (`okx-a2a ai exec`), not a persistent session — when this turn ends, the whole process exits, and anything launched in the background is killed with it, before it can possibly finish. The bridge takes several minutes (it runs the full 7-persona Council pipeline); you must block and wait for it to exit on its own within this same turn, however long that takes. Do not end the turn, do not report a result, and do not treat "it's still running" as done until the foreground command itself returns.

Steps 1-2 above (fetch context, extract founder input) are your own responsibility as the dispatching sub-session. Once you invoke it, the bridge script itself handles the rest of the pipeline:
1. Calls the deployed Olimpus Council engine (a separate A2A server on Railway) via `message/send`, and polls `tasks/get` until the 7-persona reviewed pipeline completes (this can take several minutes).
2. Formats the completed result into a Startup Workspace markdown document.
3. Calls `onchainos agent deliver` itself with that file.
4. On any failure, it calls `onchainos agent mark-failed` itself — do not do this manually in its place.

Run the command in the foreground, wait for it to actually exit, and report its output (success or failure) — do not duplicate any of its steps by hand, and do not run `agent deliver` yourself before or after it runs.

## Scope

This skill only concerns **fulfillment after `job_accepted`** for agentId 7108. Negotiation, designation, and `apply` are still handled by the normal `okx-ai` skill's `task-asp.md` / `task-asp-accept.md` flow — this hook does not change any of that.
