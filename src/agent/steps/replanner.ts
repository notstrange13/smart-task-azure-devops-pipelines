import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { SystemMessage } from '@langchain/core/messages';
import { PlanExecuteState, TaskContext } from '../../types';

/**
 * Handles the replanning step of the agent execution
 */
export class ReplannerStep {
    private chatModel: BaseChatModel;
    private taskContext: TaskContext;

    constructor(chatModel: BaseChatModel, taskContext: TaskContext) {
        this.chatModel = chatModel;
        this.taskContext = taskContext;
    }

    /**
     * Executes the replanning step to update the plan or provide final response
     */
    async execute(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
        const replannerPrompt = this.buildReplannerPrompt(state);

        try {
            const response = await this.chatModel.invoke([new SystemMessage(replannerPrompt)]);
            const content = this.extractJsonFromResponse(response.content as string);
            const replanData = JSON.parse(content);

            return this.processReplanData(replanData);
        } catch (error) {
            console.warn('Replanning failed:', error);
            return { response: 'Task completed with errors during replanning' };
        }
    }

    /**
     * Builds the replanner prompt
     */
    private buildReplannerPrompt(state: PlanExecuteState): string {
        return `For the given objective, come up with a simple step by step plan.
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
    }

    /**
     * Processes the replan data to determine next action
     */
    private processReplanData(replanData: any): Partial<PlanExecuteState> {
        if (replanData.response) {
            return { response: replanData.response };
        } else if (replanData.action && replanData.action.steps) {
            const plan = replanData.action.steps;
            return { plan };
        } else {
            return { response: 'Task completed successfully' };
        }
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
