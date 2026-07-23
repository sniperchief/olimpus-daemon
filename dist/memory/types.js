export const ALL_STAGES = ["athena", "hermes", "apollo", "themis", "ares", "hephaestus", "zeus"];
export function createInitialMemory(founderInput) {
    return {
        founderInput,
        athena: null,
        hermes: null,
        apollo: null,
        themis: null,
        ares: null,
        hephaestus: null,
        zeus: null,
        currentStage: "athena",
        status: "in_progress",
    };
}
