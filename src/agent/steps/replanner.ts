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
        console.log('REPLANNER: Analyzing progress and determining next steps...');
        console.log(`Completed steps: ${state.past_steps.length}`);
        console.log(`Remaining steps: ${state.plan.length}`);

        const replannerPrompt = this.buildReplannerPrompt(state);

        try {
            const response = await this.chatModel.invoke([new SystemMessage(replannerPrompt)]);
            const content = this.extractJsonFromResponse(response.content as string);
            const replanData = JSON.parse(content);

            return this.processReplanData(replanData);
        } catch (error) {
            console.warn('REPLANNER: Replanning failed:', error);
            console.log('REPLANNER: Task completed with errors during replanning');
            return { response: 'Task completed with errors during replanning' };
        }
    }

    /**
     * Builds the replanner prompt
     */
    private buildReplannerPrompt(state: PlanExecuteState): string {
        const completionAnalysis = this.analyzeCompletionStatus(state);

        return `You are a replanning agent. Your job is to analyze progress and decide whether to continue or complete the task.

CURRENT OBJECTIVE: ${state.input}
EXECUTION MODE: ${this.taskContext.input.mode}

PROGRESS ANALYSIS:
- Completed steps: ${state.past_steps.length}
- Remaining planned steps: ${state.plan.length}
- Recent results: ${state.past_steps
            .slice(-2)
            .map(step => `"${step[0]}" → "${step[1]}"`)
            .join('; ')}

COMPLETION STATUS ANALYSIS:
${completionAnalysis}

DECISION CRITERIA:
1. **COMPLETE THE TASK** if any of these conditions are met:
   - For DECISION mode: A pipeline variable has been successfully set
   - For EXECUTION mode: Required commands have been executed successfully  
   - You have gathered sufficient information to answer the original objective
   - Recent steps show the main goal has been achieved
   - Continuing would add no meaningful value

2. **CONTINUE WITH NEW STEPS** only if:
   - Critical information is still missing for the objective
   - Essential actions have not been completed
   - The objective genuinely cannot be answered with current progress

MODE-SPECIFIC COMPLETION INDICATORS:
- Decision mode: Look for successful variable setting, decision making, or analysis completion
- Execution mode: Look for successful command execution or process completion

INSTRUCTIONS:
- Be decisive about completion - avoid unnecessary additional steps
- Focus on the CORE objective, not peripheral tasks
- If you can provide a meaningful answer based on completed work, do so
- Only add steps that are absolutely essential

Output ONLY a JSON object:

For completion:
{
  "response": "Clear answer based on completed steps and current context"
}

For continuation (use sparingly):
{
  "action": {
    "steps": ["essential_step_1", "essential_step_2"]
  }
}`;
    }

    /**
     * Analyzes the current completion status to help with decision making
     */
    private analyzeCompletionStatus(state: PlanExecuteState): string {
        const analysis = [];

        // Check for mode-specific completion indicators
        if (this.taskContext.input.mode === 'decision') {
            const hasDecision = state.past_steps.some(
                step =>
                    step[1].includes('variable') ||
                    step[1].includes('decision') ||
                    step[1].includes('set') ||
                    step[0].includes('set_pipeline_variable')
            );
            analysis.push(
                `Decision mode completion: ${hasDecision ? 'ACHIEVED - Variable/decision set' : 'Pending - No decision variable set yet'}`
            );
        }

        if (this.taskContext.input.mode === 'execution') {
            const hasExecution = state.past_steps.some(
                step =>
                    step[1].includes('executed') ||
                    step[1].includes('completed') ||
                    step[1].includes('success') ||
                    step[0].includes('execute_command')
            );
            analysis.push(
                `Execution mode completion: ${hasExecution ? 'ACHIEVED - Commands executed' : 'Pending - No execution completed yet'}`
            );
        }

        // Check for information gathering completion
        const hasInformationGathering = state.past_steps.some(
            step =>
                step[1].includes('file') ||
                step[1].includes('read') ||
                step[1].includes('found') ||
                step[1].includes('analyzed')
        );
        analysis.push(
            `Information gathering: ${hasInformationGathering ? 'COMPLETED - Data collected' : 'Minimal - Limited information gathered'}`
        );

        // Check for error patterns
        const recentErrors = state.past_steps
            .slice(-3)
            .filter(
                step =>
                    step[1].includes('error') ||
                    step[1].includes('failed') ||
                    step[1].includes('not found')
            );
        if (recentErrors.length > 0) {
            analysis.push(
                `Error status: ${recentErrors.length} recent errors detected - consider completion with current results`
            );
        }

        return analysis.join('\n');
    }

    /**
     * Processes the replan data to determine next action
     */
    private processReplanData(replanData: any): Partial<PlanExecuteState> {
        if (replanData.response) {
            console.log('REPLANNER: Task completed! Providing final response');
            console.log(
                `Final response: ${replanData.response.length > 200 ? replanData.response.substring(0, 200) + '...' : replanData.response}`
            );
            return { response: replanData.response };
        } else if (replanData.action && replanData.action.steps) {
            const plan = replanData.action.steps;

            // Filter out vague or redundant steps
            const filteredPlan = plan.filter((step: string) => {
                const stepLower = step.toLowerCase();
                return !(
                    (stepLower.includes('analyze') && stepLower.includes('determine')) ||
                    (stepLower.includes('review') && stepLower.includes('check')) ||
                    step.length < 10 || // Too vague
                    stepLower === 'continue' ||
                    stepLower === 'proceed'
                );
            });

            if (filteredPlan.length === 0) {
                console.log(
                    'REPLANNER: All proposed steps were filtered out as non-essential. Completing task.'
                );
                return { response: 'Task completed - no additional essential steps identified' };
            }

            console.log('REPLANNER: Plan updated, continuing execution');
            console.log(`New plan steps (${filteredPlan.length} essential steps):`);
            filteredPlan.forEach((step: string, index: number) => {
                console.log(`   ${index + 1}. ${step}`);
            });
            return { plan: filteredPlan };
        } else {
            console.log('REPLANNER: Task completed successfully (no valid action provided)');
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
