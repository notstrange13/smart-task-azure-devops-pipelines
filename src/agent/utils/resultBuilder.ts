import { TaskResult, PlanExecuteState } from '../../types';

/**
 * Builds task results from execution state
 */
export class ResultBuilder {
    /**
     * Builds a TaskResult from the final execution state
     */
    static buildTaskResult(finalState: PlanExecuteState): TaskResult {
        if (finalState.response) {
            return {
                success: true,
                response: finalState.response,
            };
        }

        return {
            success: true,
        };
    }
}
