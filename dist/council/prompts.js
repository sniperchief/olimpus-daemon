import { ALL_STAGES } from "../memory/types.js";
export function buildPersonaUserContent(stage, founderInput, memory, revision) {
    const parts = [];
    parts.push(`## Founder Input\n${JSON.stringify(founderInput, null, 2)}`);
    const priorMemory = {};
    for (const key of ALL_STAGES) {
        if (key === stage)
            continue;
        const value = memory[key];
        if (value !== null)
            priorMemory[key] = value;
    }
    if (Object.keys(priorMemory).length > 0) {
        parts.push(`## Approved Prior Work\n${JSON.stringify(priorMemory, null, 2)}`);
    }
    if (revision) {
        parts.push(`## Your Previous Attempt (rejected)\n${JSON.stringify(revision.previousOutput, null, 2)}`);
        parts.push(`## Reviewer Feedback (score ${revision.verdict.score}/100, decision: ${revision.verdict.decision})\n` +
            `Weaknesses:\n${revision.verdict.weaknesses.map((w) => `- ${w}`).join("\n")}\n\n` +
            `Recommendations:\n${revision.verdict.recommendations.map((r) => `- ${r}`).join("\n")}\n\n` +
            `Revise your work to address this feedback directly.`);
    }
    return parts.join("\n\n");
}
