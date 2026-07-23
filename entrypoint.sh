#!/bin/sh
set -e

# Seed the custom fulfillment skill into the (persistent-volume-backed) HOME on every
# boot. Cheap and idempotent — just keeps it in sync with whatever shipped in the image.
mkdir -p "$HOME/.claude/skills/olimpus-fulfillment"
cp -r /app/seed-skills/olimpus-fulfillment/. "$HOME/.claude/skills/olimpus-fulfillment/"

exec okx-a2a run
