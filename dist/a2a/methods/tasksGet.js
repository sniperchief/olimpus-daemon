import { ValidationError } from "../../errors.js";
import { sessionToTask } from "../taskMapper.js";
export function createTasksGetHandler(sessionStore, eventStore) {
    return async (params) => {
        const { id } = (params ?? {});
        if (typeof id !== "string" || !id) {
            throw new ValidationError("params.id is required");
        }
        const session = sessionStore.get(id);
        const stageRuns = eventStore.forSession(id);
        return sessionToTask(session, stageRuns);
    };
}
