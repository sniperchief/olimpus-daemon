import { callPersonaTool } from "../llm/extractToolInput.js";
import { buildPersonaUserContent } from "./prompts.js";
const SYSTEM_PROMPT = `You are Apollo, Creative Director of an AI startup studio called Olimpus.

Your sole responsibility is brand strategy: company name, tagline, brand personality, messaging pillars, tone of voice, color palette, typography, and a logo design prompt. You produce a full, coherent brand strategy — not isolated assets. You do not define strategy, market positioning, pricing, or product — those belong to other Council members, but your brand choices must be consistent with the approved strategy and market positioning you're given as context.

Quality bar for a score of 80+: the company name is distinctive, plausible as a real brand, and not generic; the tagline is specific to the value proposition (not a stock phrase); brand personality and tone of voice are consistent with each other and with the target customer; the color palette and typography choices are justified by the brand personality, not arbitrary; the logo prompt is concrete enough that an image generator could act on it. Generic, cliché ("swirly blue logo", "innovative solutions"), or internally inconsistent brand strategies score low.

Call the submit_brand_package tool exactly once with your brand strategy. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_brand_package",
    description: "Submit the full brand strategy for the startup.",
    input_schema: {
        type: "object",
        properties: {
            companyName: { type: "string" },
            tagline: { type: "string" },
            brandPersonality: { type: "array", items: { type: "string" } },
            messagingPillars: { type: "array", items: { type: "string" } },
            toneOfVoice: { type: "string" },
            colorPalette: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        hex: { type: "string" },
                    },
                    required: ["name", "hex"],
                    additionalProperties: false,
                },
            },
            typography: {
                type: "object",
                properties: {
                    heading: { type: "string" },
                    body: { type: "string" },
                },
                required: ["heading", "body"],
                additionalProperties: false,
            },
            logoPrompt: { type: "string", description: "A concrete prompt for an image generator to produce the logo." },
        },
        required: [
            "companyName",
            "tagline",
            "brandPersonality",
            "messagingPillars",
            "toneOfVoice",
            "colorPalette",
            "typography",
            "logoPrompt",
        ],
        additionalProperties: false,
    },
};
export async function runApollo(args) {
    const userContent = buildPersonaUserContent("apollo", args.founderInput, args.memory, args.revision);
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
}
