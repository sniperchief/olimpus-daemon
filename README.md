# olimpus-daemon

Runs the `okx-a2a` daemon 24/7 so Olimpus (agent #7108 on OKX's Task Marketplace) can
automatically negotiate, accept, and fulfill jobs without a human present.

This is deliberately a **separate repo** from the main `olimpus` project, so that
pushes here never trigger a rebuild of the Council engine's own hosting.

**Currently hosted on**: an InterServer VPS (single slice, Ubuntu, plain Docker — not a
PaaS). Originally prototyped on Railway; migrated because this workload (a single
always-on background process, not an HTTP service) is a more natural fit for a plain
VPS + `systemd`/Docker-restart-policy than a PaaS.

## What this container does

1. Runs `okx-a2a run` as its main process (`--restart unless-stopped` keeps it alive
   across crashes; Docker itself is enabled at boot so it survives VPS reboots).
2. When OKX's marketplace sends a `job_accepted` event for agent 7108, the daemon
   dispatches a headless Claude Code sub-session, which (via the `olimpus-fulfillment`
   skill) runs `dist/bridge/aspBridge.js <jobId> 7108` **in the foreground** — the
   already-built pipeline that calls the deployed Council engine, formats the result,
   and delivers it on-chain.

## What this container does NOT do

It does not run the Council engine itself (the A2A HTTP server) — that's a separate,
already-deployed service. `PUBLIC_URL` here just points at it.

## Required host setup (VPS + Docker)

```
apt update && apt install -y docker.io git
systemctl enable --now docker
git clone https://github.com/sniperchief/olimpus-daemon.git && cd olimpus-daemon
docker build -t olimpus-daemon .
mkdir -p /data/olimpus-daemon
nano .env   # ANTHROPIC_API_KEY, MODEL_ID, PUBLIC_URL, CLAUDE_CODE_OAUTH_TOKEN
docker run -d --name olimpus-daemon --restart unless-stopped \
  -v /data/olimpus-daemon/data:/data \
  -v /data/olimpus-daemon/onchainos:/home/appuser/.onchainos \
  --env-file .env olimpus-daemon
```

**Two separate volume mounts are required** — see the gotcha below for why.

Then, one-time, log the wallet in (see the appuser gotcha — do this exactly as shown):

```
docker exec -it olimpus-daemon bash
gosu appuser onchainos wallet login --phase init
# open the printed URL in a browser, log in with the correct email
gosu appuser onchainos wallet login --phase poll
```

## Critical gotcha #1: always log in as `appuser`, never as root

`docker exec` (and `railway ssh`, if ever used again) drops you into the container as
**root**. The daemon itself runs as the unprivileged `appuser` (see Dockerfile — Claude
Code refuses to run under root). This matters a lot for `onchainos wallet login`:
**onchainos encrypts its session/keyring with a key tied to the specific OS user that
logged in** — not just file ownership. A login run as root produces a `keyring.enc` that
root can decrypt but `appuser` cannot, even though `appuser` owns the file and can read
its raw bytes. The daemon will then fail every API call with a generic `"session
expired, please login again"` error — which is misleading, since the session is fine,
it's just undecryptable by the user that actually needs it.

**Always run the login explicitly as `appuser`**:

```
gosu appuser onchainos wallet login --phase init
gosu appuser onchainos wallet login --phase poll
```

Never run a bare `onchainos wallet login ...` without `gosu appuser` in front of it —
it will "succeed" and silently produce a session the daemon can't use.

## Critical gotcha #2: onchainos ignores `$HOME`, needs its own volume mount

Just like Claude Code (see the Dockerfile comments on `/home/appuser/.claude`),
`onchainos` does **not** respect the `$HOME` env var for its own session/keyring/wallet
storage — confirmed empirically, it always writes to `/home/appuser/.onchainos`
(appuser's real passwd-based home) regardless of what `$HOME` is set to. If that path
isn't backed by its own persistent volume mount, the wallet login is silently lost the
moment the container is removed/recreated (redeploy, rebuild, `docker rm`) — even though
`$HOME` (`/data`, covering `okx-a2a`'s own daemon state) persists just fine, since
`okx-a2a` *does* respect `$HOME`.

This is why the `docker run` command above has **two** `-v` flags, not one — do not
collapse them into a single mount at `/home/appuser`, since that would also shadow the
Claude Code skills baked into `/home/appuser/.claude` at image build time.

## Critical gotcha #3: fulfillment must run in the foreground, never backgrounded

`okx-a2a` dispatches a *single, one-shot* Claude Code CLI invocation per event — it is
not a persistent session. If the dispatched sub-session runs `aspBridge.js` with
`run_in_background: true` (or any other backgrounding mechanism), the background task
gets **killed** the instant that dispatch's turn ends, typically within seconds — long
before the multi-minute Council pipeline can finish. The `olimpus-fulfillment` skill
explicitly tells the sub-session to run it in the foreground and block until it exits;
if this ever regresses, real jobs will silently stall at `job_accepted` forever (verify
via `onchainos agent status <jobId>` staying on `accepted`, never reaching `submitted`).
