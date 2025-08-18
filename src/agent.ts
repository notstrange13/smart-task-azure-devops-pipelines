import { AzureChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { 
    TaskContext, 
    TaskResult, 
    ModelType, 
    AzureOpenAIConfig,
    TaskMode,
    TaskConfig,
    PlanExecuteState, 
    Plan, 
    Response, 
    Action, 
    PastStep,
    StateAnnotation
} from './types';
import {
    Tool,
    GetPipelineVariableTool,
    ReadFileTool,
    WriteFileTool,
    GetEnvironmentVariableTool,
    ListDirectoryTool,
    ExecuteCommandTool,
    SetPipelineVariableTool,
    GetChangedFilesTool,
    GetCommitInfoTool,
    GetPullRequestInfoTool,
    GetBuildInfoTool,
    GetTestResultsTool,
    GetPipelineTimelineTool,
    GetWorkItemsTool,
    CheckArtifactExistsTool,
    GetRepositoryInfoTool,
    GetBranchPolicyTool,
    SendNotificationTool
} from './tools';

export class Agent {
    private taskContext: TaskContext;
    private chatModel: BaseChatModel;
    private tools: Tool[];
    private graph: any;

    constructor(taskContext: TaskContext) {
        this.taskContext = taskContext;
        
        // Initialize chat model based on configuration
        this.chatModel = this.initializeChatModel(taskContext.config);

        // Initialize tools
        this.tools = this.initializeTools();

        // Setup the execution graph
        this.graph = this.buildGraph();
    }

    private initializeChatModel(config: TaskConfig): BaseChatModel {
        switch (config.modelType) {
            case ModelType.AZURE_OPENAI:
                const azureOpenAIConfig = config.modelConfig as AzureOpenAIConfig;
                return new AzureChatOpenAI({
                    azureOpenAIApiKey: azureOpenAIConfig.apiKey,
                    azureOpenAIApiInstanceName: azureOpenAIConfig.instanceName,
                    azureOpenAIApiDeploymentName: azureOpenAIConfig.deploymentName,
                    azureOpenAIApiVersion: azureOpenAIConfig.apiVersion,
                    temperature: 0,
                });
            
            // Future model types can be added here:
            // case ModelType.ANTHROPIC:
            //     const anthropicConfig = config.modelConfig as AnthropicConfig;
            //     return new ChatAnthropic({
            //         apiKey: anthropicConfig.apiKey,
            //         temperature: 0,
            //     });
            // case ModelType.LOCAL_OLLAMA:
            //     const ollamaConfig = config.modelConfig as OllamaConfig;
            //     return new ChatOllama({
            //         baseUrl: ollamaConfig.baseUrl,
            //         model: ollamaConfig.model,
            //         temperature: 0,
            //     });
            
            default:
                throw new Error(`Unsupported model type: ${config.modelType}`);
        }
    }

    private initializeTools(): Tool[] {
        return [
            // File and Environment Tools
            new GetPipelineVariableTool(),
            new SetPipelineVariableTool(),
            new GetEnvironmentVariableTool(),
            new ReadFileTool(),
            new WriteFileTool(),
            new ListDirectoryTool(),
            new ExecuteCommandTool(),
            
            // Azure DevOps Context Tools
            new GetBuildInfoTool(),
            new GetChangedFilesTool(),
            new GetCommitInfoTool(),
            new GetPullRequestInfoTool(),
            
            // Advanced Azure DevOps Tools
            new GetTestResultsTool(),
            new GetPipelineTimelineTool(),
            new GetWorkItemsTool(),
            new CheckArtifactExistsTool(),
            new GetRepositoryInfoTool(),
            new GetBranchPolicyTool(),
            new SendNotificationTool()
        ];
    }

    private buildGraph(): any {
        // Create the execution graph with state management
        const graph = new StateGraph(StateAnnotation);

        // Add nodes: planner -> agent -> replan
        graph.addNode("planner", this.planStep.bind(this));
        graph.addNode("agent", this.executeStep.bind(this));
        graph.addNode("replan", this.replanStep.bind(this));

        // Define graph flow with conditional routing
        (graph as any).setEntryPoint("planner");
        (graph as any).addEdge("planner", "agent");
        (graph as any).addEdge("agent", "replan");
        
        // Conditional edge: replan decides whether to continue or end
        (graph as any).addConditionalEdges("replan", this.shouldContinue.bind(this), {
            continue: "agent",
            end: END,
        });

        // Compile and return the executable graph
        return graph.compile();
    }

    private shouldContinue(state: PlanExecuteState): string {
        // Check if we should continue or end the execution
        if (state.response) {
            return 'end';
        }
        
        if (state.plan.length === 0) {
            return 'end';
        }
        
        // Prevent infinite loops by checking if we've done too many steps
        if (state.past_steps.length > 10) {
            console.log('Maximum steps reached, terminating execution');
            return 'end';
        }
        
        return 'continue';
    }

    async execute(): Promise<TaskResult> {
        try {
            console.log('Starting Smart Task Agent execution...');

            // Initialize state for graph execution
            const initialState: PlanExecuteState = {
                input: this.taskContext.input.prompt,
                plan: [],
                past_steps: [],
                context: await this.getContext()
            };

            // Execute the graph
            console.log('Executing graph...');
            const finalState = await this.graph.invoke(initialState);

            console.log('Graph execution completed');
            return this.buildTaskResult(finalState);

        } catch (error) {
            console.error('Graph execution error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private async planStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
        console.log('Planning step...');

        const plannerPrompt = `For the given objective, come up with a simple step by step plan.
This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

Mode: ${this.taskContext.input.mode}
- Decision mode: Analyze context to make decisions, with the FINAL step being to set pipeline variables using set_pipeline_variable tool
- Execution mode: Analyze context and execute actions, with the FINAL step being to execute shell commands using execute_command tool

Available tools for when information gathering or actions are needed:
${this.tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

IMPORTANT: 
- Only use tool calls when you need to gather information or perform actions
- Reasoning, analysis, and planning steps should NOT require tool calls
- Use tools only when you need to: read files, get variables, execute commands, etc.
- For Decision mode: Final step MUST use set_pipeline_variable tool to set the decision result
- For Execution mode: Final step MUST use execute_command tool to run the required commands

Output only a JSON object with this structure:
{
  "steps": ["step1 description", "step2 description", ...]
}`;

        const response = await this.chatModel.invoke([
            new SystemMessage(plannerPrompt),
            new HumanMessage(`${state.input}\n\nAvailable context: ${JSON.stringify(state.context, null, 2)}`)
        ]);

        try {
            const planData = JSON.parse(response.content as string);
            const plan = planData.steps || [];
            console.log(`Created plan with ${plan.length} steps:`, plan);
            return { plan };
        } catch (error) {
            console.error('Failed to parse plan response:', error);
            return { plan: ['Analyze the request and provide appropriate response'] };
        }
    }

    private async executeStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
        console.log('Executing step...');

        if (state.plan.length === 0) {
            const past_steps = [...state.past_steps, ['No plan available', 'Unable to execute - no plan found'] as [string, string]];
            return { past_steps };
        }

        const currentStep = state.plan[0];
        console.log(`Executing: ${currentStep}`);

        // Use LLM to determine if this step needs tools and which ones
        const executionPrompt = `You are an execution agent. Your job is to execute the given step.

Current step: ${currentStep}
Mode: ${this.taskContext.input.mode}
Context: ${JSON.stringify(state.context, null, 2)}

Available tools for when information gathering or actions are needed:
${this.tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

EXECUTION STRATEGY:
1. First determine if this step requires tool calls or is just reasoning/analysis
2. If the step is pure reasoning, analysis, or planning - respond with just your analysis
3. If the step requires gathering information or performing actions - use appropriate tools

WHEN TO USE TOOLS:
- Use tools when you need to: read files, get variables, execute commands, list directories, etc.
- Do NOT use tools for: reasoning, analysis, planning, decision-making based on existing context

MODE-SPECIFIC REQUIREMENTS:
- Decision mode: When you need to make a final decision, use set_pipeline_variable tool
- Execution mode: When you need to execute commands, use execute_command tool

Respond with ONE of these formats:

For reasoning/analysis steps:
{
  "type": "reasoning",
  "result": "Your analysis or reasoning result"
}

For tool-requiring steps:
{
  "type": "tools",
  "tools": [
    {"tool": "tool_name", "input": "tool_input"}
  ]
}`;

        try {
            const response = await this.chatModel.invoke([
                new SystemMessage(executionPrompt)
            ]);

            const executionData = JSON.parse(response.content as string);
            let stepResult: string;

            if (executionData.type === 'reasoning') {
                // This step was pure reasoning - no tool calls needed
                stepResult = executionData.result;
                console.log(`Reasoning step result: ${stepResult}`);
            } else if (executionData.type === 'tools') {
                // This step requires tool calls
                const toolCalls = executionData.tools;
                const results: string[] = [];

                // Execute tool calls in parallel for better performance
                const toolPromises = toolCalls.map(async (toolCall: any) => {
                    const tool = this.tools.find(t => t.name === toolCall.tool);
                    if (tool) {
                        const result = await tool.execute(toolCall.input);
                        return `${tool.name}: ${result.success ? JSON.stringify(result.result) : result.error}`;
                    } else {
                        return `Unknown tool: ${toolCall.tool}`;
                    }
                });

                // Wait for all tool executions to complete
                const toolResults = await Promise.all(toolPromises);
                results.push(...toolResults);
                stepResult = results.join('\n');
                console.log(`Tool execution step result: ${stepResult}`);
            } else {
                stepResult = 'Invalid execution format - no result produced';
                console.warn('Invalid execution response format');
            }

            const past_steps = [...state.past_steps, [currentStep, stepResult] as [string, string]];
            const plan = state.plan.slice(1); // Remove executed step

            return { past_steps, plan };

        } catch (error) {
            console.error('Execution error:', error);
            const errorResult = `Execution failed: ${error instanceof Error ? error.message : String(error)}`;
            const past_steps = [...state.past_steps, [currentStep, errorResult] as [string, string]];
            const plan = state.plan.slice(1);
            
            return { past_steps, plan };
        }
    }

    private async replanStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
        console.log('Replanning step...');

        const replannerPrompt = `For the given objective, come up with a simple step by step plan.
This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

Your objective was this: ${state.input}

Your original plan was this: ${JSON.stringify(state.plan)}

You have currently done the follow steps: ${JSON.stringify(state.past_steps)}

MODE REQUIREMENTS:
- Decision mode: Final step MUST use set_pipeline_variable tool to set the decision result
- Execution mode: Final step MUST use execute_command tool to run the required commands
- Only use tool calls when information gathering or actions are needed, not for pure reasoning

Update your plan accordingly. If no more steps are needed and you can return to the user, then respond with that. Otherwise, fill out the plan. Only add steps to the plan that still NEED to be done. Do not return previously done steps as part of the plan.

Output only a JSON object with this structure for next steps:
{
  "action": {
    "steps": ["step1", "step2", ...]
  }
}

OR if complete, output:
{
  "response": "Final answer based on completed steps"
}`;

        try {
            const response = await this.chatModel.invoke([
                new SystemMessage(replannerPrompt)
            ]);

            const replanData = JSON.parse(response.content as string);
            
            if (replanData.response) {
                return { response: replanData.response };
            } else if (replanData.action && replanData.action.steps) {
                const plan = replanData.action.steps;
                console.log(`Updated plan with ${plan.length} steps:`, plan);
                return { plan };
            } else {
                return { response: 'Task completed successfully' };
            }

        } catch (error) {
            console.error('Replanning error:', error);
            return { response: 'Task completed with errors during replanning' };
        }
    }

    private async getContext(): Promise<Record<string, any>> {
        console.log('Collecting initial context...');
        
        const context: Record<string, any> = {
            mode: this.taskContext.input.mode,
            timestamp: new Date().toISOString()
        };

        // Collect additional context provided by user
        if (this.taskContext.input.additionalContext) {
            try {
                const additional = typeof this.taskContext.input.additionalContext === 'string' 
                    ? JSON.parse(this.taskContext.input.additionalContext)
                    : this.taskContext.input.additionalContext;
                context.additional = additional;
            } catch (error) {
                console.warn('Failed to parse additional context:', error);
                context.additional = this.taskContext.input.additionalContext;
            }
        }

        console.log('Initial context collected:');
        console.log(`  Mode: ${context.mode}`);
        console.log(`  Timestamp: ${context.timestamp}`);
        if (context.additional) {
            console.log(`  Additional: ${JSON.stringify(context.additional)}`);
        } else {
            console.log('  Additional: none');
        }
        console.log('Additional pipeline context will be gathered as needed');
        return context;
    }

    private buildTaskResult(finalState: PlanExecuteState): TaskResult {
        // If we have a response in the final state, include it in the result
        if (finalState.response) {
            console.log('Task execution completed successfully');
            return {
                success: true,
                response: finalState.response
            };
        }
        
        // If no response but execution completed, return basic success
        console.log('Task execution completed');
        return {
            success: true
        };
    }

}
