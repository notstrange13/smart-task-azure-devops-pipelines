import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { PlanExecuteState, TaskContext } from '../../types';
import { Tool } from '../../tools';

/**
 * Handles the planning step of the agent execution
 */
export class PlannerStep {
    private chatModel: BaseChatModel;
    private taskContext: TaskContext;
    private tools: Tool[];

    constructor(chatModel: BaseChatModel, taskContext: TaskContext, tools: Tool[]) {
        this.chatModel = chatModel;
        this.taskContext = taskContext;
        this.tools = tools;
    }

    /**
     * Executes the planning step to generate a plan based on the input
     */
    async execute(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
        const plannerPrompt = this.buildPlannerPrompt();

        const response = await this.chatModel.invoke([
            new SystemMessage(plannerPrompt),
            new HumanMessage(
                `${state.input}\n\nAvailable context: ${JSON.stringify(state.context, null, 2)}`
            ),
        ]);

        try {
            const content = this.extractJsonFromResponse(response.content as string);
            const planData = JSON.parse(content);
            const plan = planData.steps || [];
            return { plan };
        } catch (error) {
            console.warn('Failed to parse plan response:', error);
            return { plan: ['Analyze the request and provide appropriate response'] };
        }
    }

    /**
     * Builds the system prompt for the planner
     */
    private buildPlannerPrompt(): string {
        return `For the given objective, come up with a simple step by step plan.
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
    }

    /**
     * Extracts JSON content from potentially markdown-wrapped responses
     */
    private extractJsonFromResponse(content: string): string {
        // Handle markdown-wrapped JSON
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
