import { ModelType, ModelConfig } from './config';

// Task Mode enum
export enum TaskMode {
    DECISION = 'decision',
    EXECUTION = 'execution',
}

// Task Input interface
export interface TaskInput {
    prompt: string;
    mode: TaskMode;
    additionalContext: Record<string, any>;
}

// Task Result interface
export interface TaskResult {
    success: boolean;
    error?: string;
    response?: string;
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

// Re-export model types for convenience
export type { ModelType, ModelConfig } from './config';
