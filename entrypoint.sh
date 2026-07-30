#!/bin/sh
set -e

# Runs as root at this point (volume mounts land owned by root by default).
# Fix ownership so the unprivileged appuser can actually write there, then drop
# privileges.
mkdir -p "$HOME"
chown -R appuser:appuser "$HOME"

# onchainos ignores $HOME for its own session/keyring storage (confirmed
# empirically) and always writes to appuser's real passwd-based home instead.
# That path must ALSO be backed by a persistent volume mount (a separate one
# from $HOME, so it doesn't shadow the Claude Code skills baked into
# /home/appuser/.claude at image build time) — see docker run command in
# README for the matching -v flag.
mkdir -p /home/appuser/.onchainos
chown -R appuser:appuser /home/appuser/.onchainos

exec gosu appuser okx-a2a run
