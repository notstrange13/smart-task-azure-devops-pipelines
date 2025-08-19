import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { TaskContext, TaskResult, PlanExecuteState } from '../types';
import { Tool, createAllTools } from '../tools/index';
import { ModelFactory, GraphBuilder, ContextBuilder, ResultBuilder } from './utils';

/**
 * Main Agent class that orchestrates the plan-execute-replan workflow
 */
export class Agent {
    private taskContext: TaskContext;
    private chatModel: BaseChatModel;
    private tools: Tool[];
    private graph: any;
    private contextBuilder: ContextBuilder;

    constructor(taskContext: TaskContext) {
        this.taskContext = taskContext;
        this.chatModel = this.initializeChatModel();
        this.tools = this.initializeTools();
        this.contextBuilder = new ContextBuilder(taskContext);
        this.graph = this.buildGraph();
    }

    /**
     * Executes the agent workflow
     */
    async execute(): Promise<TaskResult> {
        try {
            const context = await this.contextBuilder.buildContext();

            const initialState: PlanExecuteState = {
                input: this.taskContext.input.prompt,
                plan: [],
                past_steps: [],
                context,
            };

            const finalState = await this.graph.invoke(initialState);
            return ResultBuilder.buildTaskResult(finalState);
        } catch (error) {
            console.error('Agent execution failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    /**
     * Initializes the chat model using the factory
     */
    private initializeChatModel(): BaseChatModel {
        return ModelFactory.createChatModel(this.taskContext.config);
    }

    /**
     * Initializes the available tools
     */
    private initializeTools(): Tool[] {
        return createAllTools();
    }

    /**
     * Builds the execution graph using the graph builder
     */
    private buildGraph(): any {
        const graphBuilder = new GraphBuilder(this.chatModel, this.taskContext, this.tools);
        return graphBuilder.buildGraph();
    }
}
