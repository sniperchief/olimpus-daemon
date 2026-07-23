#!/bin/sh
set -e

# Runs as root at this point (Railway's volume mount lands owned by root by
# default). Fix ownership so the unprivileged appuser can actually write its
# wallet session / daemon state / Claude credentials there, then drop privileges.
mkdir -p "$HOME"
chown -R appuser:appuser "$HOME"

# Seed the custom fulfillment skill into the (persistent-volume-backed) HOME on every
# boot. Cheap and idempotent — just keeps it in sync with whatever shipped in the image.
mkdir -p "$HOME/.claude/skills/olimpus-fulfillment"
cp -r /app/seed-skills/olimpus-fulfillment/. "$HOME/.claude/skills/olimpus-fulfillment/"
chown -R appuser:appuser "$HOME/.claude"

exec gosu appuser okx-a2a run
