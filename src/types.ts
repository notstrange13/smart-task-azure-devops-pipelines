import { z } from 'zod';
import { Annotation } from '@langchain/langgraph';

// Task Mode enum
export enum TaskMode {
    DECISION = 'decision',
    EXECUTION = 'execution'
}

// Model Type enum
export enum ModelType {
    AZURE_OPENAI = 'azure_openai'
    // Future model types can be added here
    // ANTHROPIC = 'anthropic',
    // LOCAL_OLLAMA = 'local_ollama',
    // etc.
}

// Azure OpenAI Configuration
export interface AzureOpenAIConfig {
    instanceName: string;
    apiKey: string;
    deploymentName: string;
    apiVersion: string;
}

// Union type for all possible model configurations
export type ModelConfig = AzureOpenAIConfig;
// Future: | AnthropicConfig | OllamaConfig | etc.

// Task Input interface
export interface TaskInput {
    prompt: string;
    mode: TaskMode;
    additionalContext: Record<string, any>;
}

// Task Configuration interface
export interface TaskConfig {
    modelType: ModelType;
    modelConfig: ModelConfig;
}

// Task Context interface
export interface TaskContext {
    input: TaskInput;
    config: TaskConfig;
}

// Task Result interface
export interface TaskResult {
    success: boolean;
    error?: string;
    response?: string;
}

// Agent Types - Plan execution schema
export const PlanSchema = z.object({
    steps: z.array(z.string()).describe("different steps to follow, should be in sorted order")
});

export type Plan = z.infer<typeof PlanSchema>;

// Response schema for final output
export const ResponseSchema = z.object({
    response: z.string().describe("Final response to user")
});

export type Response = z.infer<typeof ResponseSchema>;

// Action schema for replanning decisions
export const ActionSchema = z.object({
    action: z.union([ResponseSchema, PlanSchema]).describe(
        "Action to perform. If you want to respond to user, use Response. " +
        "If you need to further use tools to get the answer, use Plan."
    )
});

export type Action = z.infer<typeof ActionSchema>;

// Past step tuple - [step, result]
export type PastStep = [string, string];

// Main state schema for graph execution
export const PlanExecuteStateSchema = z.object({
    input: z.string().describe("Original user input/prompt"),
    plan: z.array(z.string()).default([]).describe("Current execution plan"),
    past_steps: z.array(z.tuple([z.string(), z.string()])).default([]).describe("Previously executed steps and their results"),
    response: z.string().optional().describe("Final response when complete"),
    context: z.record(z.string(), z.any()).default({}).describe("Gathered context for decision making")
});

export type PlanExecuteState = z.infer<typeof PlanExecuteStateSchema>;

// Tool execution result
export const ToolResultSchema = z.object({
    name: z.string(),
    result: z.any(),
    success: z.boolean(),
    error: z.string().optional()
});

export type ToolResult = z.infer<typeof ToolResultSchema>;

// Graph StateAnnotation definition based on PlanExecuteState
export const StateAnnotation = Annotation.Root({
    input: Annotation<string>({
        reducer: (left, right) => right ?? left,
        default: () => "",
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
