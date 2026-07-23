import { config } from "../config.js";
export function buildAgentCard() {
    return {
        protocolVersion: "0.3.0",
        name: "Olimpus",
        description: "AI startup studio — turns a founder's idea into a full Startup Workspace (strategy, market analysis, brand, pricing, go-to-market, product roadmap, investor pitch) via a reviewed multi-agent Council.",
        url: config.publicUrl,
        version: "0.1.0",
        provider: { organization: "Olimpus" },
        capabilities: {
            streaming: false,
            pushNotifications: false,
        },
        defaultInputModes: ["application/json"],
        defaultOutputModes: ["application/json"],
        skills: [
            {
                id: "generate-startup-workspace",
                name: "Generate Startup Workspace",
                description: "Given a founder's idea, target audience, and primary goal, runs the full Council — Athena (strategy), Hermes (market), Apollo (brand), Themis (business model), Ares (growth), Hephaestus (product), Zeus (investor pitch) — each gated by the Argus reviewer, and returns a complete Startup Workspace.",
                tags: ["startup", "strategy", "branding", "market-research", "fundraising"],
                examples: [
                    "Generate a startup workspace for a subscription box for artisanal coffee, targeting home baristas, primary goal is validating product-market fit.",
                ],
                inputModes: ["application/json"],
                outputModes: ["application/json"],
            },
        ],
    };
}
