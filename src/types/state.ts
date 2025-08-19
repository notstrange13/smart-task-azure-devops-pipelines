import { Annotation } from '@langchain/langgraph';

// Main state type for LangGraph execution
export interface PlanExecuteState {
    input: string;
    plan: string[];
    past_steps: [string, string][];
    response?: string;
    context: Record<string, any>;
}

// Graph StateAnnotation definition based on PlanExecuteState
export const StateAnnotation = Annotation.Root({
    input: Annotation<string>({
        reducer: (left, right) => right ?? left,
        default: () => '',
    }),
    plan: Annotation<string[]>({
        reducer: (left, right) => right ?? left,
        default: () => [],
    }),
    past_steps: Annotation<[string, string][]>({
        reducer: (left, right) => right ?? left,
        default: () => [],
    }),
    context: Annotation<Record<string, any>>({
        reducer: (left, right) => ({ ...left, ...right }),
        default: () => ({}),
    }),
    response: Annotation<string | undefined>({
        reducer: (left, right) => right ?? left,
        default: () => undefined,
    }),
});
