import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { SystemMessage } from '@langchain/core/messages';
import { PlanExecuteState, TaskContext } from '../../types';
import { Tool } from '../../tools';

/**
 * Handles the execution step of the agent
 */
export class ExecutorStep {
    private chatModel: BaseChatModel;
    private taskContext: TaskContext;
    private tools: Tool[];

    constructor(chatModel: BaseChatModel, taskContext: TaskContext, tools: Tool[]) {
        this.chatModel = chatModel;
        this.taskContext = taskContext;
        this.tools = tools;
    }

    /**
     * Executes the current step in the plan
     */
    async execute(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
        if (state.plan.length === 0) {
            console.log('EXECUTOR: No plan available to execute');
            const past_steps = [
                ...state.past_steps,
                ['No plan available', 'Unable to execute - no plan found'] as [string, string],
            ];
            return { past_steps };
        }

        const currentStep = state.plan[0];
        console.log(`EXECUTOR: Executing step ${state.past_steps.length + 1} of ${state.past_steps.length + state.plan.length}`);
        console.log(`Current step: ${currentStep}`);
        
        const executionPrompt = this.buildExecutionPrompt(currentStep, state);

        try {
            const response = await this.chatModel.invoke([new SystemMessage(executionPrompt)]);
            const content = this.extractJsonFromResponse(response.content as string);
            const executionData = JSON.parse(content);

            const stepResult = await this.processExecutionData(executionData);
            
            console.log(`EXECUTOR: Step completed successfully`);
            console.log(`Result: ${stepResult.length > 200 ? stepResult.substring(0, 200) + '...' : stepResult}`);

            const past_steps = [...state.past_steps, [currentStep, stepResult] as [string, string]];
            const plan = state.plan.slice(1); // Remove executed step

            return { past_steps, plan };
        } catch (error) {
            return this.handleExecutionError(error, currentStep, state);
        }
    }

    /**
     * Builds the execution prompt for the current step
     */
    private buildExecutionPrompt(currentStep: string, state: PlanExecuteState): string {
        return `You are an execution agent. Your job is to execute the given step.

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
    }

    /**
     * Processes the execution data based on its type
     */
    private async processExecutionData(executionData: any): Promise<string> {
        if (executionData.type === 'reasoning') {
            return executionData.result;
        } else if (executionData.type === 'tools') {
            return await this.executeTools(executionData.tools);
        } else {
            return 'Invalid execution format - no result produced';
        }
    }

    /**
     * Executes tool calls in parallel
     */
    private async executeTools(toolCalls: any[]): Promise<string> {
        const toolPromises = toolCalls.map(async (toolCall: any) => {
            const tool = this.tools.find(t => t.name === toolCall.tool);
            if (tool) {
                const result = await tool.execute(toolCall.input);
                return `${tool.name}: ${result.success ? JSON.stringify(result.result) : result.error}`;
            } else {
                return `Unknown tool: ${toolCall.tool}`;
            }
        });

        const toolResults = await Promise.all(toolPromises);
        return toolResults.join('\n');
    }

    /**
     * Handles execution errors
     */
    private handleExecutionError(
        error: any,
        currentStep: string,
        state: PlanExecuteState
    ): Partial<PlanExecuteState> {
        const errorResult = `Execution failed: ${error instanceof Error ? error.message : String(error)}`;
        const past_steps = [...state.past_steps, [currentStep, errorResult] as [string, string]];
        const plan = state.plan.slice(1);

        return { past_steps, plan };
    }

    /**
     * Extracts JSON content from potentially markdown-wrapped responses
     */
    private extractJsonFromResponse(content: string): string {
        if (content.includes('```json')) {
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return jsonMatch[1];
            }
        } else if (content.includes('```')) {
            const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return jsonMatch[1];
            }
        }

        return content;
    }
}
