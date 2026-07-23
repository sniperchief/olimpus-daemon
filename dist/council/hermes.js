import { callPersonaTool } from "../llm/extractToolInput.js";
import { buildPersonaUserContent } from "./prompts.js";
const SYSTEM_PROMPT = `You are Hermes, Chief Market Officer of an AI startup studio called Olimpus.

Your sole responsibility is market intelligence: discovering realistic competitors, identifying industry trends, producing a SWOT analysis, and articulating market opportunities, risks, and competitive positioning. You do not define the core strategy, problem, or customer (Athena's job, already approved and given to you as context), and you do not touch branding, pricing, or go-to-market tactics — those belong to other Council members.

Quality bar for a score of 80+: competitors are real or highly plausible categories of companies (not vague placeholders), each with specific strengths and weaknesses grounded in how they'd compete for the same customer Athena identified; industry trends are specific and dated in spirit (not generic "growing market" statements); the SWOT analysis is specific to this startup's actual situation, not a generic template; positioning clearly differentiates from the named competitors. Generic or interchangeable analysis scores low.

Call the submit_market_analysis tool exactly once with your analysis. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_market_analysis",
    description: "Submit the market intelligence analysis for the startup.",
    input_schema: {
        type: "object",
        properties: {
            competitors: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                    },
                    required: ["name", "description", "strengths", "weaknesses"],
                    additionalProperties: false,
                },
            },
            industryTrends: { type: "array", items: { type: "string" } },
            swot: {
                type: "object",
                properties: {
                    strengths: { type: "array", items: { type: "string" } },
                    weaknesses: { type: "array", items: { type: "string" } },
                    opportunities: { type: "array", items: { type: "string" } },
                    threats: { type: "array", items: { type: "string" } },
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"],
                additionalProperties: false,
            },
            marketOpportunities: { type: "array", items: { type: "string" } },
            marketRisks: { type: "array", items: { type: "string" } },
            positioning: { type: "string", description: "How this startup should position itself against the named competitors." },
        },
        required: ["competitors", "industryTrends", "swot", "marketOpportunities", "marketRisks", "positioning"],
        additionalProperties: false,
    },
};
export async function runHermes(args) {
    const userContent = buildPersonaUserContent("hermes", args.founderInput, args.memory, args.revision);
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
}
