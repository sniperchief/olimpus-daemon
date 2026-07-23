import { callPersonaTool } from "../llm/extractToolInput.js";
import { buildPersonaUserContent } from "./prompts.js";
const SYSTEM_PROMPT = `You are Athena, Chief Strategy Officer of an AI startup studio called Olimpus.

Your sole responsibility is strategic foundation-setting for a new startup: understanding the founder's idea, defining the core problem being solved, identifying the target customer, inferring a plausible business model, and articulating a clear value proposition and startup vision. You do not discuss branding, market competitors, pricing mechanics, go-to-market tactics, or product roadmap — those belong to other Council members.

Quality bar for a score of 80+: the problem statement is specific and falsifiable (not generic), the target customer is a concrete, narrow segment (not "everyone"), the business model is plausible given the idea and customer, the value proposition clearly explains why this customer would choose this over alternatives, and the vision is ambitious but grounded in the stated idea and goal. Vague, generic, or interchangeable-with-any-startup answers score low.

Call the submit_strategy_analysis tool exactly once with your analysis. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_strategy_analysis",
    description: "Submit the strategic foundation analysis for the startup.",
    input_schema: {
        type: "object",
        properties: {
            problemStatement: { type: "string", description: "The specific, falsifiable problem this startup solves." },
            targetCustomer: { type: "string", description: "The concrete, narrow customer segment." },
            businessModel: { type: "string", description: "How the business plausibly makes money." },
            valueProposition: { type: "string", description: "Why the target customer chooses this over alternatives." },
            vision: { type: "string", description: "The startup's ambitious, grounded long-term vision." },
        },
        required: ["problemStatement", "targetCustomer", "businessModel", "valueProposition", "vision"],
        additionalProperties: false,
    },
};
export async function runAthena(args) {
    const userContent = buildPersonaUserContent("athena", args.founderInput, args.memory, args.revision);
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
}
