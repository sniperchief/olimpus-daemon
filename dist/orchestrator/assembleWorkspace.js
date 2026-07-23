import { ALL_STAGES } from "../memory/types.js";
export function assembleWorkspace(memory, stageRuns) {
    const stageMetadata = ALL_STAGES.map((stage) => {
        const runs = stageRuns.filter((r) => r.stage === stage).sort((a, b) => a.attempt_number - b.attempt_number);
        const last = runs[runs.length - 1];
        return {
            agent: stage,
            attempts: runs.length,
            finalArgusScore: last?.argus_score ?? null,
            finalArgusDecision: last?.argus_decision ?? null,
        };
    });
    return {
        athena: memory.athena,
        hermes: memory.hermes,
        apollo: memory.apollo,
        themis: memory.themis,
        ares: memory.ares,
        hephaestus: memory.hephaestus,
        zeus: memory.zeus,
        stageMetadata,
    };
}
