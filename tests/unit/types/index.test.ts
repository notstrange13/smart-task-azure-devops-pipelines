import {
    // Task-related types
    TaskMode,
    TaskInput,
    TaskResult,
    TaskConfig,
    TaskContext,
    ModelConfig,

    // Configuration types
    ModelType,
    AzureOpenAIConfig,

    // State and execution types
    PlanExecuteState,
    StateAnnotation,

    // Tool-related types
    ToolResult,
} from '../../../src/types';

// Direct imports for comparison
import { TaskMode as DirectTaskMode } from '../../../src/types/task';
import { ModelType as DirectModelType } from '../../../src/types/config';
import { PlanExecuteState as DirectPlanExecuteState } from '../../../src/types/state';
import { ToolResult as DirectToolResult } from '../../../src/types/tool';

describe('Types Index', () => {
    describe('Task-related exports', () => {
        it('should export TaskMode enum', () => {
            expect(TaskMode).toBeDefined();
            expect(TaskMode.DECISION).toBe('decision');
            expect(TaskMode.EXECUTION).toBe('execution');
        });

        it('should export the same TaskMode as direct import', () => {
            expect(TaskMode).toBe(DirectTaskMode);
            expect(TaskMode.DECISION).toBe(DirectTaskMode.DECISION);
            expect(TaskMode.EXECUTION).toBe(DirectTaskMode.EXECUTION);
        });

        it('should export TaskInput interface', () => {
            const input: TaskInput = {
                prompt: 'test',
                mode: TaskMode.DECISION,
                additionalContext: {},
            };
            expect(input.prompt).toBe('test');
        });

        it('should export TaskResult interface', () => {
            const result: TaskResult = {
                success: true,
                response: 'test response',
            };
            expect(result.success).toBe(true);
        });

        it('should export TaskConfig interface', () => {
            const config: TaskConfig = {
                modelType: ModelType.AZURE_OPENAI,
                modelConfig: {
                    instanceName: 'test',
                    apiKey: 'key',
                    deploymentName: 'deployment',
                    apiVersion: 'version',
                },
            };
            expect(config.modelType).toBe(ModelType.AZURE_OPENAI);
        });

        it('should export TaskContext interface', () => {
            const context: TaskContext = {
                input: {
                    prompt: 'test',
                    mode: TaskMode.DECISION,
                    additionalContext: {},
                },
                config: {
                    modelType: ModelType.AZURE_OPENAI,
                    modelConfig: {
                        instanceName: 'test',
                        apiKey: 'key',
                        deploymentName: 'deployment',
                        apiVersion: 'version',
                    },
                },
            };
            expect(context.input.prompt).toBe('test');
        });

        it('should export ModelConfig type', () => {
            const config: ModelConfig = {
                instanceName: 'test',
                apiKey: 'key',
                deploymentName: 'deployment',
                apiVersion: 'version',
            };
            expect(config.instanceName).toBe('test');
        });
    });

    describe('Configuration exports', () => {
        it('should export ModelType enum', () => {
            expect(ModelType).toBeDefined();
            expect(ModelType.AZURE_OPENAI).toBe('AZURE_OPENAI');
        });

        it('should export the same ModelType as direct import', () => {
            expect(ModelType).toBe(DirectModelType);
            expect(ModelType.AZURE_OPENAI).toBe(DirectModelType.AZURE_OPENAI);
        });

        it('should export AzureOpenAIConfig interface', () => {
            const config: AzureOpenAIConfig = {
                instanceName: 'test-instance',
                apiKey: 'test-key',
                deploymentName: 'test-deployment',
                apiVersion: 'test-version',
            };
            expect(config.instanceName).toBe('test-instance');
        });
    });

    describe('State and execution exports', () => {
        it('should export PlanExecuteState interface', () => {
            const state: PlanExecuteState = {
                input: 'test input',
                plan: ['step1', 'step2'],
                past_steps: [['action', 'result']],
                context: { key: 'value' },
                response: 'test response',
            };
            expect(state.input).toBe('test input');
        });

        it('should export the same PlanExecuteState as direct import', () => {
            // Since these are interfaces, we can only test that they compile with the same structure
            const state1: PlanExecuteState = {
                input: 'test',
                plan: [],
                past_steps: [],
                context: {},
            };

            const state2: DirectPlanExecuteState = state1; // Should compile if types are the same
            expect(state2).toBe(state1);
        });

        it('should export StateAnnotation', () => {
            expect(StateAnnotation).toBeDefined();
            expect(typeof StateAnnotation).toBe('object');
        });
    });

    describe('Tool-related exports', () => {
        it('should export ToolResult interface', () => {
            const result: ToolResult = {
                name: 'test-tool',
                result: 'test result',
                success: true,
            };
            expect(result.name).toBe('test-tool');
        });

        it('should export the same ToolResult as direct import', () => {
            const result1: ToolResult = {
                name: 'test',
                result: 'data',
                success: true,
            };

            const result2: DirectToolResult = result1; // Should compile if types are the same
            expect(result2).toBe(result1);
        });
    });

    describe('Module structure', () => {
        it('should have all expected exports', () => {
            const typesModule = require('../../../src/types');

            const expectedExports = [
                // Enums (value exports)
                'TaskMode',
                'ModelType',
                'StateAnnotation',

                // Type exports are not enumerable in runtime, but enums and values are
            ];

            expectedExports.forEach(exportName => {
                expect(typesModule).toHaveProperty(exportName);
            });
        });

        it('should export enums as runtime values', () => {
            const typesModule = require('../../../src/types');

            expect(typesModule.TaskMode).toBe(TaskMode);
            expect(typesModule.ModelType).toBe(ModelType);
            expect(typesModule.StateAnnotation).toBe(StateAnnotation);
        });

        it('should maintain enum consistency across exports', () => {
            expect(Object.keys(TaskMode)).toEqual(['DECISION', 'EXECUTION']);
            expect(Object.values(TaskMode)).toEqual(['decision', 'execution']);

            expect(Object.keys(ModelType)).toEqual(['AZURE_OPENAI']);
            expect(Object.values(ModelType)).toEqual(['AZURE_OPENAI']);
        });
    });

    describe('Type compatibility', () => {
        it('should allow cross-type assignments for compatible interfaces', () => {
            const azureConfig: AzureOpenAIConfig = {
                instanceName: 'test',
                apiKey: 'key',
                deploymentName: 'deployment',
                apiVersion: 'version',
            };

            const modelConfig: ModelConfig = azureConfig; // Should work due to type union
            expect(modelConfig).toBe(azureConfig);
        });

        it('should work in complex type scenarios', () => {
            const createCompleteContext = (): TaskContext => {
                return {
                    input: {
                        prompt: 'Create a comprehensive test',
                        mode: TaskMode.EXECUTION,
                        additionalContext: {
                            priority: 'high',
                            tags: ['testing', 'automation'],
                        },
                    },
                    config: {
                        modelType: ModelType.AZURE_OPENAI,
                        modelConfig: {
                            instanceName: 'prod-instance',
                            apiKey: 'prod-key-123',
                            deploymentName: 'gpt-4-deployment',
                            apiVersion: '2024-02-15-preview',
                        },
                    },
                };
            };

            const context = createCompleteContext();
            expect(context.input.mode).toBe(TaskMode.EXECUTION);
            expect(context.config.modelType).toBe(ModelType.AZURE_OPENAI);
        });

        it('should work with utility functions', () => {
            const isSuccessfulToolResult = (result: ToolResult): boolean => {
                return result.success && result.error === undefined;
            };

            const createTaskResult = (success: boolean, message: string): TaskResult => {
                return {
                    success,
                    response: success ? message : undefined,
                    error: success ? undefined : message,
                };
            };

            const toolResult: ToolResult = {
                name: 'test-tool',
                result: 'success data',
                success: true,
            };

            const taskResult = createTaskResult(true, 'Task completed');

            expect(isSuccessfulToolResult(toolResult)).toBe(true);
            expect(taskResult.success).toBe(true);
            expect(taskResult.response).toBe('Task completed');
        });
    });
});
