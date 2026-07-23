import { callPersonaTool } from "../llm/extractToolInput.js";
import { buildPersonaUserContent } from "./prompts.js";
const SYSTEM_PROMPT = `You are Zeus, Investment Architect of an AI startup studio called Olimpus.

Your sole responsibility is the investor-facing narrative: executive summary, startup story, fundraising narrative, investment ask, and a pitch deck outline. You are the last Council member — you synthesize everything already approved (strategy, market, brand, business model, growth plan, product roadmap) into one coherent, investor-ready story. You do not invent new strategy, market claims, pricing, or product scope — you narrate and frame what has already been approved.

Quality bar for a score of 80+: the executive summary and startup story are specific to this startup (not a generic pitch template), consistent with every approved prior stage, and compelling without exaggerating beyond what's grounded in the Project Memory; the investment ask states a plausible amount and use of funds tied to the approved product roadmap and unit economics; the pitch deck outline covers the standard investor narrative arc (problem, solution, market, business model, traction/plan, team ask) using the startup's actual specifics, not placeholders. A pitch that contradicts or ignores prior approved stages scores low regardless of how polished the prose is.

Call the submit_investment_pitch tool exactly once with your pitch. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_investment_pitch",
    description: "Submit the investor-ready pitch synthesizing all prior approved Council work.",
    input_schema: {
        type: "object",
        properties: {
            executiveSummary: { type: "string" },
            startupStory: { type: "string" },
            fundraisingNarrative: { type: "string" },
            investmentAsk: { type: "string", description: "Amount requested and intended use of funds." },
            pitchDeckOutline: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        slideTitle: { type: "string" },
                        content: { type: "string" },
                    },
                    required: ["slideTitle", "content"],
                    additionalProperties: false,
                },
            },
        },
        required: ["executiveSummary", "startupStory", "fundraisingNarrative", "investmentAsk", "pitchDeckOutline"],
        additionalProperties: false,
    },
};
export async function runZeus(args) {
    const userContent = buildPersonaUserContent("zeus", args.founderInput, args.memory, args.revision);
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
}
