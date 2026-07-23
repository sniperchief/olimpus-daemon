import { callPersonaTool } from "../llm/extractToolInput.js";
const SYSTEM_PROMPT = `You extract structured founder input from a raw task description posted on the OKX AI Task Marketplace, where a founder has hired the "Olimpus" startup studio agent to generate a Startup Workspace.

The raw text may be free-form natural language (task title, description, service params) rather than neatly labeled fields. Read it and extract: the core startup idea, the target audience (if mentioned), and the founder's primary goal (if not stated, infer a reasonable default such as "launch an MVP and validate product-market fit").

Call the extract_founder_input tool exactly once. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "extract_founder_input",
    description: "Extract structured founder input (idea, targetAudience, primaryGoal) from raw task text.",
    input_schema: {
        type: "object",
        properties: {
            idea: { type: "string", description: "The core startup idea." },
            targetAudience: { type: "string", description: "The target audience, if mentioned in the task text." },
            primaryGoal: { type: "string", description: "The founder's primary goal for this engagement." },
        },
        required: ["idea", "primaryGoal"],
        additionalProperties: false,
    },
};
export async function parseTaskDescription(rawTaskText) {
    return callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent: `## Raw OKX Task Context\n${rawTaskText}`,
        tool: TOOL,
    });
}
