#!/bin/sh
set -e

# Runs as root at this point (Railway's volume mount lands owned by root by
# default). Fix ownership so the unprivileged appuser can actually write its
# wallet session / daemon state there, then drop privileges.
mkdir -p "$HOME"
chown -R appuser:appuser "$HOME"

exec gosu appuser okx-a2a run
