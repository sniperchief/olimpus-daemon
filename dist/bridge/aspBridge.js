import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { config } from "../config.js";
import { formatWorkspaceAsMarkdown } from "./formatWorkspace.js";
const execFileAsync = promisify(execFile);
const POLL_INTERVAL_MS = 15_000;
const MAX_WAIT_MS = 30 * 60 * 1000;
function extractCliError(stdout) {
    try {
        const parsed = JSON.parse(stdout);
        if (parsed && parsed.ok === false && typeof parsed.error === "string") {
            return parsed.error;
        }
    }
    catch {
        // stdout wasn't JSON — fall through and let the caller use the raw exception.
    }
    return null;
}
async function runOnchainos(args) {
    try {
        const { stdout } = await execFileAsync("onchainos", args, { maxBuffer: 10 * 1024 * 1024 });
        return stdout;
    }
    catch (err) {
        const stdout = err.stdout;
        const cliError = stdout ? extractCliError(stdout) : null;
        throw new Error(`onchainos ${args.join(" ")} failed: ${cliError ?? err.message}`);
    }
}
async function rpc(method, params) {
    const res = await fetch(config.publicUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: method, method, params }),
    });
    const body = (await res.json());
    if (body.error)
        throw new Error(`${method} failed: ${body.error.message}`);
    return body.result;
}
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Bridges an OKX AI Task Marketplace job (ASP role, already `job_accepted`) into
 * Olimpus's own headless A2A engine, then delivers the result back on-chain.
 *
 * Run this once the ASP session's `next-action` script indicates the job is
 * accepted and work should begin — see task-asp.md: "deliver is gated by job_accepted".
 *
 * The founder input (idea / targetAudience / primaryGoal) must already be extracted by
 * the caller — this script does not read raw task text or call an LLM itself, so it
 * needs no Anthropic API key of its own.
 *
 * Usage: node dist/bridge/aspBridge.js <jobId> <aspAgentId> <founderInputJson>
 */
async function main() {
    const [jobId, aspAgentId, founderInputJson] = process.argv.slice(2);
    if (!jobId || !aspAgentId || !founderInputJson) {
        console.error("Usage: bridge <jobId> <aspAgentId> <founderInputJson>");
        process.exit(1);
    }
    let founderInput;
    try {
        founderInput = JSON.parse(founderInputJson);
    }
    catch (err) {
        console.error("[bridge] Failed to parse founderInputJson argument:", err);
        process.exit(1);
    }
    console.log("[bridge] Using founder input:", founderInput);
    console.log("[bridge] Submitting to Olimpus Council via message/send...");
    const task = await rpc("message/send", {
        message: {
            role: "user",
            messageId: `okx-${jobId}`,
            parts: [{ kind: "data", data: founderInput }],
        },
    });
    const taskId = task.id;
    console.log(`[bridge] Olimpus task created: ${taskId}`);
    const deadline = Date.now() + MAX_WAIT_MS;
    let finalTask;
    while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL_MS);
        finalTask = await rpc("tasks/get", { id: taskId });
        const state = finalTask.status.state;
        console.log(`[bridge] Olimpus task ${taskId} status: ${state}`);
        if (state === "completed" || state === "failed")
            break;
    }
    if (!finalTask || finalTask.status.state !== "completed") {
        const reason = finalTask?.status?.message ?? "timed out waiting for completion";
        console.error(`[bridge] Olimpus engine did not complete successfully: ${reason}`);
        console.log(`[bridge] Marking job ${jobId} as failed on-chain...`);
        await runOnchainos(["agent", "mark-failed", jobId, "--provider", aspAgentId]);
        return;
    }
    const workspace = finalTask.artifacts[0].parts[0].data;
    const markdown = formatWorkspaceAsMarkdown(workspace);
    const dir = mkdtempSync(path.join(tmpdir(), "olimpus-workspace-"));
    const filePath = path.join(dir, `startup-workspace-${jobId}.md`);
    writeFileSync(filePath, markdown, "utf-8");
    console.log(`[bridge] Wrote deliverable to ${filePath}`);
    console.log(`[bridge] Delivering job ${jobId} on-chain...`);
    await runOnchainos([
        "agent",
        "deliver",
        jobId,
        "--file",
        filePath,
        "--message",
        "Your Startup Workspace is ready for review.",
        "--agent-id",
        aspAgentId,
    ]);
    console.log("[bridge] Delivered. Awaiting founder acceptance to release escrow.");
}
main().catch((err) => {
    console.error("[bridge] Fatal error:", err);
    process.exit(1);
});
