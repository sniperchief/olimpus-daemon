function bulletList(items) {
    return items.map((i) => `- ${i}`).join("\n");
}
export function formatWorkspaceAsMarkdown(workspace) {
    const sections = ["# Startup Workspace — Olimpus\n"];
    if (workspace.zeus) {
        sections.push(`## Executive Summary\n${workspace.zeus.executiveSummary}\n\n` +
            `## Startup Story\n${workspace.zeus.startupStory}\n\n` +
            `## Fundraising Narrative\n${workspace.zeus.fundraisingNarrative}\n\n` +
            `## Investment Ask\n${workspace.zeus.investmentAsk}\n\n` +
            `## Pitch Deck Outline\n${workspace.zeus.pitchDeckOutline
                .map((s) => `### ${s.slideTitle}\n${s.content}`)
                .join("\n\n")}`);
    }
    if (workspace.athena) {
        sections.push(`## Strategy (Athena)\n` +
            `**Problem:** ${workspace.athena.problemStatement}\n\n` +
            `**Target Customer:** ${workspace.athena.targetCustomer}\n\n` +
            `**Business Model:** ${workspace.athena.businessModel}\n\n` +
            `**Value Proposition:** ${workspace.athena.valueProposition}\n\n` +
            `**Vision:** ${workspace.athena.vision}`);
    }
    if (workspace.hermes) {
        sections.push(`## Market Analysis (Hermes)\n` +
            `**Competitors:**\n${workspace.hermes.competitors
                .map((c) => `- **${c.name}** — ${c.description}`)
                .join("\n")}\n\n` +
            `**Industry Trends:**\n${bulletList(workspace.hermes.industryTrends)}\n\n` +
            `**SWOT:**\n- Strengths: ${workspace.hermes.swot.strengths.join("; ")}\n- Weaknesses: ${workspace.hermes.swot.weaknesses.join("; ")}\n- Opportunities: ${workspace.hermes.swot.opportunities.join("; ")}\n- Threats: ${workspace.hermes.swot.threats.join("; ")}\n\n` +
            `**Positioning:** ${workspace.hermes.positioning}`);
    }
    if (workspace.apollo) {
        sections.push(`## Brand Strategy (Apollo)\n` +
            `**Company Name:** ${workspace.apollo.companyName}\n\n` +
            `**Tagline:** ${workspace.apollo.tagline}\n\n` +
            `**Tone of Voice:** ${workspace.apollo.toneOfVoice}\n\n` +
            `**Messaging Pillars:**\n${bulletList(workspace.apollo.messagingPillars)}\n\n` +
            `**Logo Prompt:** ${workspace.apollo.logoPrompt}`);
    }
    if (workspace.themis) {
        sections.push(`## Business Model & Pricing (Themis)\n` +
            `**Pricing Strategy:** ${workspace.themis.pricingStrategy}\n\n` +
            `**Revenue Model:** ${workspace.themis.revenueModel}\n\n` +
            `**Recommendation:** ${workspace.themis.businessModelRecommendation}\n\n` +
            `**Unit Economics:** CAC ${workspace.themis.unitEconomicsAssumptions.estimatedCAC}, LTV ${workspace.themis.unitEconomicsAssumptions.estimatedLTV}, Gross Margin ${workspace.themis.unitEconomicsAssumptions.grossMargin}, Break-even ${workspace.themis.unitEconomicsAssumptions.breakEvenTimeline}`);
    }
    if (workspace.ares) {
        sections.push(`## Go-To-Market Plan (Ares)\n` +
            `**Launch Strategy:** ${workspace.ares.launchStrategy}\n\n` +
            `**Acquisition Channels:**\n${bulletList(workspace.ares.customerAcquisitionChannels)}\n\n` +
            `**Growth Loops:**\n${bulletList(workspace.ares.growthLoops)}\n\n` +
            `**Success Metrics:**\n${workspace.ares.successMetrics.map((m) => `- ${m.metric}: ${m.target}`).join("\n")}`);
    }
    if (workspace.hephaestus) {
        sections.push(`## Product Roadmap (Hephaestus)\n` +
            `**MVP Definition:** ${workspace.hephaestus.mvpDefinition}\n\n` +
            `**Roadmap:**\n${workspace.hephaestus.productRoadmap
                .map((p) => `- **${p.phase}** (${p.timeline}): ${p.milestones.join("; ")}`)
                .join("\n")}`);
    }
    sections.push(`## Council Review Summary\n` +
        workspace.stageMetadata
            .map((m) => `- **${m.agent}**: ${m.attempts} attempt(s), final Argus score ${m.finalArgusScore}/100 (${m.finalArgusDecision})`)
            .join("\n"));
    return sections.join("\n\n---\n\n");
}
