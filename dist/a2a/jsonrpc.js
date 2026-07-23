import { ValidationError } from "../errors.js";
export function parseJsonRpcRequest(body) {
    if (typeof body !== "object" ||
        body === null ||
        body.jsonrpc !== "2.0" ||
        typeof body.method !== "string") {
        throw new ValidationError("Malformed JSON-RPC 2.0 request");
    }
    return body;
}
export async function dispatch(request, methods) {
    const handler = methods[request.method];
    if (!handler) {
        return { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: `Unknown method: ${request.method}` } };
    }
    try {
        const result = await handler(request.params);
        return { jsonrpc: "2.0", id: request.id, result };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal error";
        const code = err instanceof ValidationError ? -32602 : -32603;
        return { jsonrpc: "2.0", id: request.id, error: { code, message } };
    }
}
