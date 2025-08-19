import { StateGraph, END } from '@langchain/langgraph';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StateAnnotation, PlanExecuteState, TaskContext } from '../../types';
import { Tool } from '../../tools';
import { PlannerStep, ExecutorStep, ReplannerStep } from '../steps';

/**
 * Builds the LangGraph execution graph
 */
export class GraphBuilder {
    private chatModel: BaseChatModel;
    private taskContext: TaskContext;
    private tools: Tool[];

    constructor(chatModel: BaseChatModel, taskContext: TaskContext, tools: Tool[]) {
        this.chatModel = chatModel;
        this.taskContext = taskContext;
        this.tools = tools;
    }

    /**
     * Builds and configures the execution graph
     */
    buildGraph(): any {
        const graph = new StateGraph(StateAnnotation);

        // Create step instances
        const plannerStep = new PlannerStep(this.chatModel, this.taskContext, this.tools);
        const executorStep = new ExecutorStep(this.chatModel, this.taskContext, this.tools);
        const replannerStep = new ReplannerStep(this.chatModel, this.taskContext);

        // Add nodes with bound step methods
        graph.addNode('planner', plannerStep.execute.bind(plannerStep));
        graph.addNode('agent', executorStep.execute.bind(executorStep));
        graph.addNode('replan', replannerStep.execute.bind(replannerStep));

        // Configure graph flow
        (graph as any).setEntryPoint('planner');
        (graph as any).addEdge('planner', 'agent');
        (graph as any).addEdge('agent', 'replan');

        // Conditional edge: replan decides whether to continue or end
        (graph as any).addConditionalEdges('replan', this.shouldContinue.bind(this), {
            agent: 'agent',
            end: END,
        });

        return (graph as any).compile();
    }

    /**
     * Determines whether the execution should continue or end
     */
    private shouldContinue(state: PlanExecuteState): string {
        // If we have a response, we're done
        if (state.response) {
            return 'end';
        }
        // If there are more steps in the plan, continue
        if (state.plan.length === 0) {
            return 'end';
        }
        return 'agent';
    }
}
