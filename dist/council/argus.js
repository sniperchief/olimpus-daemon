import { callPersonaTool } from "../llm/extractToolInput.js";
import { ALL_STAGES } from "../memory/types.js";
const SYSTEM_PROMPT = `You are Argus, the Review Council of an AI startup studio called Olimpus.

You do not generate content. Your sole responsibility is to review the output of one Council member — Athena (strategy), Hermes (market), Apollo (brand), Themis (business/pricing), Ares (growth/go-to-market), Hephaestus (product/roadmap), or Zeus (investor pitch) — against the shared Project Memory, and return a rigorous, honest quality verdict.

Score 0-100. A score of 50 or above means APPROVE and the work moves forward unchanged. Below 50 means REVISE: the work goes back to the same Council member with your specific feedback. Use ESCALATE only when the work is fundamentally unworkable given the founder's input (not merely mediocre) or a revision has already failed to fix the same core issue.

Ground every weakness and recommendation in specifics from the candidate output and the Project Memory — vague feedback like "make it better" is useless because it gets fed back to the author verbatim. Check for: internal consistency with prior approved stages, genuine specificity (reject generic, template-like, or interchangeable-with-any-startup answers), and whether the reasoning actually follows from the founder's stated idea and goal.

Call the submit_review tool exactly once with your verdict. Do not output any prose outside the tool call.`;
const TOOL = {
    name: "submit_review",
    description: "Submit the quality review verdict for a Council member's output.",
    input_schema: {
        type: "object",
        properties: {
            score: { type: "integer", description: "Quality score from 0 to 100." },
            decision: { type: "string", enum: ["APPROVE", "REVISE", "ESCALATE"] },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
        },
        required: ["score", "decision", "strengths", "weaknesses", "recommendations"],
        additionalProperties: false,
    },
};
function buildReviewContent(stage, memory, candidateOutput) {
    const priorMemory = {};
    for (const key of ALL_STAGES) {
        if (key === stage)
            continue;
        const value = memory[key];
        if (value !== null)
            priorMemory[key] = value;
    }
    const parts = [
        `## Founder Input\n${JSON.stringify(memory.founderInput, null, 2)}`,
    ];
    if (Object.keys(priorMemory).length > 0) {
        parts.push(`## Approved Prior Work\n${JSON.stringify(priorMemory, null, 2)}`);
    }
    parts.push(`## Candidate Output from ${stage} (under review)\n${JSON.stringify(candidateOutput, null, 2)}`);
    return parts.join("\n\n");
}
export async function reviewStage(stage, memory, candidateOutput) {
    const userContent = buildReviewContent(stage, memory, candidateOutput);
    const raw = await callPersonaTool({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        tool: TOOL,
    });
    return {
        ...raw,
        score: Math.max(0, Math.min(100, Math.round(raw.score))),
        strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
        weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
        recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
    };
}
