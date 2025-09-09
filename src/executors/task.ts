import * as tl from 'azure-pipelines-task-lib/task';
import { Agent } from '../agent';
import { TaskContext, ModelType, TaskMode, AzureOpenAIConfig } from '../types';
import { InputProvider, ConfigProvider } from '../providers';

/**
 * Main task executor that orchestrates the entire workflow
 */
export class TaskExecutor {
    private inputProvider: InputProvider;
    private configProvider: ConfigProvider;

    constructor() {
        this.inputProvider = new InputProvider();
        this.configProvider = new ConfigProvider();
    }

    /**
     * Executes the complete task workflow
     */
    async execute(): Promise<void> {
        try {
            console.log('Smart Task starting...');

            // Log environment information for debugging
            console.log('=== Environment Debug Information ===');
            console.log(`Current working directory: ${process.cwd()}`);
            console.log(
                `Build.SourcesDirectory: ${tl.getVariable('Build.SourcesDirectory') || 'undefined'}`
            );
            console.log(
                `System.DefaultWorkingDirectory: ${tl.getVariable('System.DefaultWorkingDirectory') || 'undefined'}`
            );
            console.log(
                `Build.Repository.LocalPath: ${tl.getVariable('Build.Repository.LocalPath') || 'undefined'}`
            );
            console.log(
                `Agent.BuildDirectory: ${tl.getVariable('Agent.BuildDirectory') || 'undefined'}`
            );
            console.log('=====================================');

            // Get and validate all inputs
            const { prompt, mode, additionalContext } = this.inputProvider.getTaskInputs();
            console.log(`Smart Task starting in ${mode} mode...`);

            // Get and validate model configuration
            const { modelType, modelConfig } = this.configProvider.getModelConfig();

            // Create task context
            const taskContext = this.createTaskContext(
                prompt,
                mode,
                additionalContext,
                modelType,
                modelConfig
            );

            // Execute the agent
            await this.executeAgent(taskContext);

            console.log('Smart Task completed successfully');
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Creates the task context object
     */
    private createTaskContext(
        prompt: string,
        mode: TaskMode,
        additionalContext: Record<string, any>,
        modelType: ModelType,
        modelConfig: AzureOpenAIConfig
    ): TaskContext {
        return {
            input: {
                prompt,
                mode,
                additionalContext,
            },
            config: {
                modelType,
                modelConfig,
            },
        };
    }

    /**
     * Executes the agent with the given context
     */
    private async executeAgent(taskContext: TaskContext): Promise<void> {
        const agent = new Agent(taskContext);
        const result = await agent.execute();

        if (!result.success) {
            throw new Error(result.error || 'Smart Task failed');
        }
    }

    /**
     * Handles errors and sets appropriate task result
     */
    private handleError(error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Smart Task failed:', errorMessage);
        tl.setResult(tl.TaskResult.Failed, `Smart Task failed: ${errorMessage}`);
    }
}
