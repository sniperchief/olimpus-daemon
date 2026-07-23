import { callPersonaTool } from "../llm/extractToolInput.js";
import { buildPersonaUserContent } from "./prompts.js";
const SYSTEM_PROMPT = `You are Themis, Chief Business Officer of an AI startup studio called Olimpus.

Your sole responsibility is the business model: pricing strategy, revenue model, a subscription/marketplace/usage-based/other model recommendation, business model validation, monetization rationale, and unit economics assumptions. You explain every recommendation — no unexplained numbers or claims. You do not touch strategy, market analysis, branding, growth tactics, or product roadmap — those belong to other Council members, but your pricing must be consistent with the approved target customer, positioning, and brand you're given as context.

Quality bar for a score of 80+: pricing is a specific number or range grounded in the target customer's stated spend and the competitive landscape (not an arbitrary guess); the revenue model matches how this specific business actually captures value; unit economics assumptions (CAC, LTV, gross margin, break-even timeline) are plausible estimates with a stated basis, not fabricated precision; monetization rationale explicitly explains why this pricing/model won't drive away the target customer or leave money on the table. Generic "$X/month subscription" with no grounding in prior context scores low.

Call the submit_business_model tool exactly once with your analysis. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_business_model",
    description: "Submit the business model and pricing strategy for the startup.",
    input_schema: {
        type: "object",
        properties: {
            pricingStrategy: { type: "string" },
            revenueModel: { type: "string" },
            businessModelRecommendation: {
                type: "string",
                description: "e.g. subscription, marketplace, usage-based, freemium — with rationale.",
            },
            businessModelValidation: { type: "string" },
            monetizationRationale: { type: "string" },
            unitEconomicsAssumptions: {
                type: "object",
                properties: {
                    estimatedCAC: { type: "string" },
                    estimatedLTV: { type: "string" },
                    grossMargin: { type: "string" },
                    breakEvenTimeline: { type: "string" },
                },
                required: ["estimatedCAC", "estimatedLTV", "grossMargin", "breakEvenTimeline"],
                additionalProperties: false,
            },
        },
        required: [
            "pricingStrategy",
            "revenueModel",
            "businessModelRecommendation",
            "businessModelValidation",
            "monetizationRationale",
            "unitEconomicsAssumptions",
        ],
        additionalProperties: false,
    },
};
export async function runThemis(args) {
    const userContent = buildPersonaUserContent("themis", args.founderInput, args.memory, args.revision);
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
}
