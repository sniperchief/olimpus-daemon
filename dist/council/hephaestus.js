import { callPersonaTool } from "../llm/extractToolInput.js";
import { buildPersonaUserContent } from "./prompts.js";
const SYSTEM_PROMPT = `You are Hephaestus, Chief Product Officer of an AI startup studio called Olimpus.

Your sole responsibility is product: MVP definition, feature prioritization, product roadmap (phases, timelines, milestones), and high-level technical planning. You decide what should and shouldn't be built first. You do not touch strategy, market analysis, branding, pricing, or growth tactics — those belong to other Council members, but your MVP scope must actually deliver the value proposition and serve the target customer you're given as context.

Quality bar for a score of 80+: the MVP definition is genuinely minimal (cuts scope hard, doesn't just relabel "the whole product" as MVP) while still delivering the core value proposition; feature prioritization has honest trade-offs (not everything is "must-have"); the roadmap has realistic phases with concrete milestones, not just "Phase 1: Launch, Phase 2: Grow"; technical planning notes flag real constraints or decisions relevant to this specific product. Generic roadmaps that could apply to any startup score low.

Call the submit_product_plan tool exactly once with your plan. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_product_plan",
    description: "Submit the MVP definition and product roadmap for the startup.",
    input_schema: {
        type: "object",
        properties: {
            mvpDefinition: { type: "string" },
            featurePrioritization: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        feature: { type: "string" },
                        priority: {
                            type: "string",
                            enum: ["must-have", "should-have", "could-have", "wont-have"],
                        },
                        rationale: { type: "string" },
                    },
                    required: ["feature", "priority", "rationale"],
                    additionalProperties: false,
                },
            },
            productRoadmap: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        phase: { type: "string" },
                        timeline: { type: "string" },
                        milestones: { type: "array", items: { type: "string" } },
                    },
                    required: ["phase", "timeline", "milestones"],
                    additionalProperties: false,
                },
            },
            technicalPlanningNotes: { type: "string" },
        },
        required: ["mvpDefinition", "featurePrioritization", "productRoadmap", "technicalPlanningNotes"],
        additionalProperties: false,
    },
};
export async function runHephaestus(args) {
    const userContent = buildPersonaUserContent("hephaestus", args.founderInput, args.memory, args.revision);
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
}
