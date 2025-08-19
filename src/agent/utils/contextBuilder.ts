import { TaskContext } from '../../types';

/**
 * Builds context for agent execution
 */
export class ContextBuilder {
    private taskContext: TaskContext;

    constructor(taskContext: TaskContext) {
        this.taskContext = taskContext;
    }

    /**
     * Gathers all available context for decision making
     */
    async buildContext(): Promise<Record<string, any>> {
        const context: Record<string, any> = {
            mode: this.taskContext.input.mode,
            timestamp: new Date().toISOString(),
        };

        // Add additional context if provided
        if (this.taskContext.input.additionalContext) {
            try {
                const additionalContext =
                    typeof this.taskContext.input.additionalContext === 'string'
                        ? JSON.parse(this.taskContext.input.additionalContext)
                        : this.taskContext.input.additionalContext;
                
                Object.assign(context, additionalContext);
            } catch (error) {
                console.warn('Failed to parse additional context:', error);
            }
        }

        return context;
    }
}
