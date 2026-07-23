FROM node:22-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates gosu git \
    && rm -rf /var/lib/apt/lists/*

# Claude Code refuses its permission-bypass mode when running as root/UID 0 (a hard
# security check on its side, confirmed empirically — not something any okx-a2a
# permission preset can route around). So the daemon actually runs as this
# unprivileged user; gosu (above) drops from root to it in the entrypoint, after
# root has had a chance to fix ownership of the mounted volume.
RUN useradd -m -u 10001 -s /bin/bash appuser

# Install onchainos + Claude Code CLI while HOME is still the image's baked-in root,
# then relocate the binaries to /usr/local/bin (a system path, not under HOME).
# This matters because the persistent Railway volume gets mounted over HOME at
# container *runtime*, which would otherwise shadow anything installed under
# ~/.local/bin during the image build.
ENV HOME=/root
RUN curl -sSL https://raw.githubusercontent.com/okx/onchainos-skills/main/install.sh | sh \
    && cp /root/.local/bin/onchainos /usr/local/bin/onchainos
RUN curl -fsSL https://claude.ai/install.sh | bash \
    && cp /root/.local/bin/claude /usr/local/bin/claude
RUN npm install -g @okxweb3/a2a-node

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY dist ./dist
COPY skills ./seed-skills
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Claude Code resolves its own skills/config directory from appuser's real home
# (confirmed empirically — it does NOT follow the $HOME env var override the way
# onchainos/okx-a2a do), so the OKX skills + our custom fulfillment skill have to be
# installed into /home/appuser/.claude/skills directly, as appuser, at build time.
# HOME must be switched to appuser's own home first — it was still /root from the
# install steps above, which is not writable by appuser (npm cache EACCES otherwise).
ENV HOME=/home/appuser
USER appuser
RUN npx --yes skills add okx/onchainos-skills --yes -g
RUN mkdir -p /home/appuser/.claude/skills/olimpus-fulfillment \
    && cp -r /app/seed-skills/olimpus-fulfillment/. /home/appuser/.claude/skills/olimpus-fulfillment/
USER root

# HOME points at the persistent volume Railway mounts at /data for everything that
# DOES respect it — onchainos's wallet session (~/.onchainos) and okx-a2a's daemon
# state both live here and survive redeploys.
ENV HOME=/data
ENV OKX_AGENT_TASK_HOME=/data/.okx-agent-task
ENV PATH="/usr/local/bin:${PATH}"

ENTRYPOINT ["/app/entrypoint.sh"]
