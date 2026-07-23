import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./client.js";
import { config } from "../config.js";
import { PersonaOutputError, PersonaRefusalError } from "../errors.js";
async function createMessage(opts) {
    return anthropic.messages.create({
        model: config.modelId,
        max_tokens: 8192,
        system: opts.systemPrompt,
        tools: [{ ...opts.tool, strict: true }],
        tool_choice: { type: "tool", name: opts.tool.name },
        messages: [{ role: "user", content: opts.userContent }],
    });
}
export async function callPersonaTool(opts) {
    let response;
    try {
        response = await createMessage(opts);
    }
    catch (err) {
        if (err instanceof Anthropic.RateLimitError ||
            err instanceof Anthropic.InternalServerError ||
            err instanceof Anthropic.APIConnectionError) {
            response = await createMessage(opts);
        }
        else {
            throw err;
        }
    }
    if (response.stop_reason === "refusal") {
        throw new PersonaRefusalError(opts.tool.name, response.stop_details);
    }
    const toolUse = response.content.find((b) => b.type === "tool_use" && b.name === opts.tool.name);
    if (!toolUse) {
        throw new PersonaOutputError(`Expected tool_use for ${opts.tool.name}, got stop_reason=${response.stop_reason}`);
    }
    return toolUse.input;
}
