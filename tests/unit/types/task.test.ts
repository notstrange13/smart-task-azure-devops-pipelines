import { 
    TaskMode, 
    TaskInput, 
    TaskResult, 
    TaskConfig, 
    TaskContext,
    ModelConfig 
} from '../../../src/types/task';
import { ModelType } from '../../../src/types/config';

describe('Task Types', () => {
    describe('TaskMode enum', () => {
        it('should have DECISION value', () => {
            expect(TaskMode.DECISION).toBe('decision');
        });

        it('should have EXECUTION value', () => {
            expect(TaskMode.EXECUTION).toBe('execution');
        });

        it('should have expected enum keys', () => {
            const keys = Object.keys(TaskMode);
            expect(keys).toContain('DECISION');
            expect(keys).toContain('EXECUTION');
            expect(keys).toHaveLength(2);
        });

        it('should have expected enum values', () => {
            const values = Object.values(TaskMode);
            expect(values).toContain('decision');
            expect(values).toContain('execution');
            expect(values).toHaveLength(2);
        });

        it('should be usable in switch statements', () => {
            const testMode = (mode: TaskMode): string => {
                switch (mode) {
                    case TaskMode.DECISION:
                        return 'making decision';
                    case TaskMode.EXECUTION:
                        return 'executing task';
                    default:
                        return 'unknown';
                }
            };

            expect(testMode(TaskMode.DECISION)).toBe('making decision');
            expect(testMode(TaskMode.EXECUTION)).toBe('executing task');
        });

        it('should work with array includes', () => {
            const validModes = Object.values(TaskMode);
            expect(validModes.includes(TaskMode.DECISION)).toBe(true);
            expect(validModes.includes(TaskMode.EXECUTION)).toBe(true);
            expect(validModes.includes('invalid' as TaskMode)).toBe(false);
        });
    });

    describe('TaskInput interface', () => {
        it('should accept valid task input object', () => {
            const input: TaskInput = {
                prompt: 'Test prompt',
                mode: TaskMode.DECISION,
                additionalContext: { key: 'value' },
            };

            expect(input.prompt).toBe('Test prompt');
            expect(input.mode).toBe(TaskMode.DECISION);
            expect(input.additionalContext).toEqual({ key: 'value' });
        });

        it('should work with empty additional context', () => {
            const input: TaskInput = {
                prompt: 'Test prompt',
                mode: TaskMode.EXECUTION,
                additionalContext: {},
            };

            expect(input.additionalContext).toEqual({});
        });

        it('should work with complex additional context', () => {
            const complexContext = {
                user: { id: 123, name: 'John' },
                settings: { theme: 'dark', notifications: true },
                metadata: ['tag1', 'tag2'],
                nested: { deep: { value: 'test' } },
            };

            const input: TaskInput = {
                prompt: 'Complex prompt',
                mode: TaskMode.DECISION,
                additionalContext: complexContext,
            };

            expect(input.additionalContext).toEqual(complexContext);
        });

        it('should accept both task modes', () => {
            const decisionInput: TaskInput = {
                prompt: 'Decision prompt',
                mode: TaskMode.DECISION,
                additionalContext: {},
            };

            const executionInput: TaskInput = {
                prompt: 'Execution prompt',
                mode: TaskMode.EXECUTION,
                additionalContext: {},
            };

            expect(decisionInput.mode).toBe('decision');
            expect(executionInput.mode).toBe('execution');
        });
    });

    describe('TaskResult interface', () => {
        it('should accept successful result without error', () => {
            const result: TaskResult = {
                success: true,
                response: 'Task completed successfully',
            };

            expect(result.success).toBe(true);
            expect(result.response).toBe('Task completed successfully');
            expect(result.error).toBeUndefined();
        });

        it('should accept failed result with error', () => {
            const result: TaskResult = {
                success: false,
                error: 'Task failed due to invalid input',
            };

            expect(result.success).toBe(false);
            expect(result.error).toBe('Task failed due to invalid input');
            expect(result.response).toBeUndefined();
        });

        it('should accept result with both response and error', () => {
            const result: TaskResult = {
                success: false,
                error: 'Partial failure occurred',
                response: 'Partial response available',
            };

            expect(result.success).toBe(false);
            expect(result.error).toBe('Partial failure occurred');
            expect(result.response).toBe('Partial response available');
        });

        it('should accept minimal successful result', () => {
            const result: TaskResult = {
                success: true,
            };

            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
            expect(result.response).toBeUndefined();
        });

        it('should accept minimal failed result', () => {
            const result: TaskResult = {
                success: false,
            };

            expect(result.success).toBe(false);
            expect(result.error).toBeUndefined();
            expect(result.response).toBeUndefined();
        });
    });

    describe('TaskConfig interface', () => {
        it('should accept valid task configuration', () => {
            const config: TaskConfig = {
                modelType: ModelType.AZURE_OPENAI,
                modelConfig: {
                    instanceName: 'test-instance',
                    apiKey: 'test-key',
                    deploymentName: 'test-deployment',
                    apiVersion: '2024-02-15-preview',
                },
            };

            expect(config.modelType).toBe(ModelType.AZURE_OPENAI);
            expect(config.modelConfig.instanceName).toBe('test-instance');
        });

        it('should maintain type relationship with ModelConfig', () => {
            const modelConfig: ModelConfig = {
                instanceName: 'test',
                apiKey: 'key',
                deploymentName: 'deployment',
                apiVersion: 'version',
            };

            const taskConfig: TaskConfig = {
                modelType: ModelType.AZURE_OPENAI,
                modelConfig,
            };

            expect(taskConfig.modelConfig).toBe(modelConfig);
        });
    });

    describe('TaskContext interface', () => {
        it('should accept valid task context', () => {
            const input: TaskInput = {
                prompt: 'Test prompt',
                mode: TaskMode.DECISION,
                additionalContext: { test: true },
            };

            const config: TaskConfig = {
                modelType: ModelType.AZURE_OPENAI,
                modelConfig: {
                    instanceName: 'test-instance',
                    apiKey: 'test-key',
                    deploymentName: 'test-deployment',
                    apiVersion: '2024-02-15-preview',
                },
            };

            const context: TaskContext = {
                input,
                config,
            };

            expect(context.input).toBe(input);
            expect(context.config).toBe(config);
            expect(context.input.mode).toBe(TaskMode.DECISION);
            expect(context.config.modelType).toBe(ModelType.AZURE_OPENAI);
        });

        it('should work with complex nested structure', () => {
            const context: TaskContext = {
                input: {
                    prompt: 'Complex prompt with detailed requirements',
                    mode: TaskMode.EXECUTION,
                    additionalContext: {
                        user: { id: 123, role: 'admin' },
                        project: { name: 'TestProject', id: 'proj-123' },
                        settings: { timeout: 30000, retries: 3 },
                    },
                },
                config: {
                    modelType: ModelType.AZURE_OPENAI,
                    modelConfig: {
                        instanceName: 'prod-instance',
                        apiKey: 'prod-key',
                        deploymentName: 'gpt-4-deployment',
                        apiVersion: '2024-02-15-preview',
                    },
                },
            };

            expect(context.input.additionalContext.user.id).toBe(123);
            expect(context.config.modelConfig.deploymentName).toBe('gpt-4-deployment');
        });
    });

    describe('Type Re-exports', () => {
        it('should re-export ModelType from config', () => {
            expect(ModelType.AZURE_OPENAI).toBe('AZURE_OPENAI');
        });

        it('should maintain type compatibility with re-exported types', () => {
            const createConfig = (modelType: ModelType, modelConfig: ModelConfig): TaskConfig => {
                return { modelType, modelConfig };
            };

            const config = createConfig(ModelType.AZURE_OPENAI, {
                instanceName: 'test',
                apiKey: 'key',
                deploymentName: 'deployment',
                apiVersion: 'version',
            });

            expect(config.modelType).toBe(ModelType.AZURE_OPENAI);
        });
    });
});
