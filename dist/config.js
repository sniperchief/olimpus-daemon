import "dotenv/config";
function required(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing required env var: ${name}`);
    return value;
}
const port = Number(process.env.PORT ?? 8080);
export const config = {
    port,
    modelId: process.env.MODEL_ID ?? "claude-haiku-4-5",
    get anthropicApiKey() {
        return required("ANTHROPIC_API_KEY");
    },
    maxRevisionAttempts: 3,
    dbPath: process.env.DB_PATH ?? "data/olimpus.db",
    publicUrl: process.env.PUBLIC_URL ?? `http://localhost:${port}/`,
};
