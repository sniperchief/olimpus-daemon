function bulletList(items) {
    return items?.length ? items.map((i) => `- ${i}`).join("\n") : "_Not provided._";
}
export function formatWorkspaceAsMarkdown(workspace) {
    const sections = ["# Startup Workspace — Olimpus\n"];
    if (workspace.zeus) {
        const pitchDeck = workspace.zeus.pitchDeckOutline?.length
            ? workspace.zeus.pitchDeckOutline.map((s) => `### ${s.slideTitle}\n${s.content}`).join("\n\n")
            : "_Not provided._";
        sections.push(`## Executive Summary\n${workspace.zeus.executiveSummary}\n\n` +
            `## Startup Story\n${workspace.zeus.startupStory}\n\n` +
            `## Fundraising Narrative\n${workspace.zeus.fundraisingNarrative}\n\n` +
            `## Investment Ask\n${workspace.zeus.investmentAsk}\n\n` +
            `## Pitch Deck Outline\n${pitchDeck}`);
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
        const competitors = workspace.hermes.competitors?.length
            ? workspace.hermes.competitors.map((c) => `- **${c.name}** — ${c.description}`).join("\n")
            : "_Not provided._";
        const swot = workspace.hermes.swot ?? {};
        sections.push(`## Market Analysis (Hermes)\n` +
            `**Competitors:**\n${competitors}\n\n` +
            `**Industry Trends:**\n${bulletList(workspace.hermes.industryTrends)}\n\n` +
            `**SWOT:**\n- Strengths: ${swot.strengths?.join("; ") || "_Not provided._"}\n- Weaknesses: ${swot.weaknesses?.join("; ") || "_Not provided._"}\n- Opportunities: ${swot.opportunities?.join("; ") || "_Not provided._"}\n- Threats: ${swot.threats?.join("; ") || "_Not provided._"}\n\n` +
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
        const successMetrics = workspace.ares.successMetrics?.length
            ? workspace.ares.successMetrics.map((m) => `- ${m.metric}: ${m.target}`).join("\n")
            : "_Not provided._";
        sections.push(`## Go-To-Market Plan (Ares)\n` +
            `**Launch Strategy:** ${workspace.ares.launchStrategy}\n\n` +
            `**Acquisition Channels:**\n${bulletList(workspace.ares.customerAcquisitionChannels)}\n\n` +
            `**Growth Loops:**\n${bulletList(workspace.ares.growthLoops)}\n\n` +
            `**Success Metrics:**\n${successMetrics}`);
    }
    if (workspace.hephaestus) {
        const roadmap = workspace.hephaestus.productRoadmap?.length
            ? workspace.hephaestus.productRoadmap
                .map((p) => `- **${p.phase}** (${p.timeline}): ${p.milestones.join("; ")}`)
                .join("\n")
            : "_Not provided._";
        sections.push(`## Product Roadmap (Hephaestus)\n` +
            `**MVP Definition:** ${workspace.hephaestus.mvpDefinition}\n\n` +
            `**Roadmap:**\n${roadmap}`);
    }
    sections.push(`## Council Review Summary\n` +
        workspace.stageMetadata
            .map((m) => `- **${m.agent}**: ${m.attempts} attempt(s), final Argus score ${m.finalArgusScore}/100 (${m.finalArgusDecision})`)
            .join("\n"));
    return sections.join("\n\n---\n\n");
}
