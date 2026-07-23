import { createServer } from "node:http";
import { buildAgentCard } from "./a2a/agentCard.js";
import { parseJsonRpcRequest, dispatch } from "./a2a/jsonrpc.js";
import { createMessageSendHandler } from "./a2a/methods/messageSend.js";
import { createTasksGetHandler } from "./a2a/methods/tasksGet.js";
import { SessionStore } from "./memory/sessionStore.js";
import { EventStore } from "./memory/eventStore.js";
import { PayloadTooLargeError } from "./errors.js";
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB — founder input is small; this is a generous ceiling, not a real limit.
function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let totalBytes = 0;
        req.on("data", (chunk) => {
            totalBytes += chunk.length;
            if (totalBytes > MAX_BODY_BYTES) {
                req.destroy();
                reject(new PayloadTooLargeError(`Request body exceeds ${MAX_BODY_BYTES} bytes`));
                return;
            }
            chunks.push(chunk);
        });
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        req.on("error", reject);
    });
}
function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(body);
}
export function createApp(db) {
    const sessionStore = new SessionStore(db);
    const eventStore = new EventStore(db);
    const methods = {
        "message/send": createMessageSendHandler(sessionStore, eventStore),
        "tasks/get": createTasksGetHandler(sessionStore, eventStore),
    };
    return async (req, res) => {
        if (req.method === "GET" && req.url === "/.well-known/agent-card.json") {
            sendJson(res, 200, buildAgentCard());
            return;
        }
        if (req.method === "POST" && req.url === "/") {
            try {
                const raw = await readBody(req);
                const parsed = parseJsonRpcRequest(JSON.parse(raw));
                const response = await dispatch(parsed, methods);
                sendJson(res, 200, response);
            }
            catch (err) {
                const status = err instanceof PayloadTooLargeError ? 413 : 400;
                sendJson(res, status, {
                    jsonrpc: "2.0",
                    id: null,
                    error: { code: -32700, message: err instanceof Error ? err.message : "Parse error" },
                });
            }
            return;
        }
        sendJson(res, 404, { error: "Not found" });
    };
}
export function startServer(db, port) {
    const app = createApp(db);
    const server = createServer(app);
    server.listen(port, () => {
        console.log(`Olimpus A2A server listening on http://localhost:${port}`);
    });
    return server;
}
