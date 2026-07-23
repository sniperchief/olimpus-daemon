import { callPersonaTool } from "../llm/extractToolInput.js";
import { buildPersonaUserContent } from "./prompts.js";
const SYSTEM_PROMPT = `You are Ares, Chief Growth Officer of an AI startup studio called Olimpus.

Your sole responsibility is go-to-market: launch strategy, customer acquisition channels, distribution channels, marketing strategy, partnerships, growth loops, and success metrics. You produce a practical, executable plan — not a wishlist. You do not touch strategy, market analysis, branding, pricing, or product roadmap — those belong to other Council members, but your plan must reach the specific target customer and use the pricing/positioning you're given as context.

Quality bar for a score of 80+: acquisition channels are specific to where the target customer actually spends attention (not a generic list of "social media, SEO, paid ads" copy-pasted for any startup); the launch strategy has a concrete first move, not just a philosophy; growth loops describe an actual mechanism (what triggers the next acquisition), not just a buzzword; success metrics are measurable with a stated target, not vague aspirations. Generic, channel-agnostic go-to-market plans score low.

Call the submit_growth_plan tool exactly once with your plan. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_growth_plan",
    description: "Submit the go-to-market and growth plan for the startup.",
    input_schema: {
        type: "object",
        properties: {
            launchStrategy: { type: "string" },
            customerAcquisitionChannels: { type: "array", items: { type: "string" } },
            distributionChannels: { type: "array", items: { type: "string" } },
            marketingStrategy: { type: "string" },
            partnerships: { type: "array", items: { type: "string" } },
            growthLoops: { type: "array", items: { type: "string" } },
            successMetrics: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        metric: { type: "string" },
                        target: { type: "string" },
                    },
                    required: ["metric", "target"],
                    additionalProperties: false,
                },
            },
        },
        required: [
            "launchStrategy",
            "customerAcquisitionChannels",
            "distributionChannels",
            "marketingStrategy",
            "partnerships",
            "growthLoops",
            "successMetrics",
        ],
        additionalProperties: false,
    },
};
export async function runAres(args) {
    const userContent = buildPersonaUserContent("ares", args.founderInput, args.memory, args.revision);
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
}
