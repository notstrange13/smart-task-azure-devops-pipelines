import { ModelType, AzureOpenAIConfig, ModelConfig } from '../../../src/types/config';

describe('Config Types', () => {
    describe('ModelType enum', () => {
        it('should have AZURE_OPENAI value', () => {
            expect(ModelType.AZURE_OPENAI).toBe('AZURE_OPENAI');
        });

        it('should have expected enum keys', () => {
            const keys = Object.keys(ModelType);
            expect(keys).toContain('AZURE_OPENAI');
            expect(keys).toHaveLength(1);
        });

        it('should have expected enum values', () => {
            const values = Object.values(ModelType);
            expect(values).toContain('AZURE_OPENAI');
            expect(values).toHaveLength(1);
        });

        it('should be usable in string comparisons', () => {
            const modelType = ModelType.AZURE_OPENAI;
            expect(modelType === 'AZURE_OPENAI').toBe(true);
            expect(modelType === ('ANTHROPIC' as any)).toBe(false);
        });

        it('should be usable in switch statements', () => {
            const modelType = ModelType.AZURE_OPENAI;
            let result: string;

            switch (modelType) {
                case ModelType.AZURE_OPENAI:
                    result = 'azure';
                    break;
                default:
                    result = 'unknown';
            }

            expect(result).toBe('azure');
        });
    });

    describe('AzureOpenAIConfig interface', () => {
        it('should accept valid configuration object', () => {
            const config: AzureOpenAIConfig = {
                instanceName: 'test-instance',
                apiKey: 'test-key',
                deploymentName: 'test-deployment',
                apiVersion: '2024-02-15-preview',
            };

            expect(config.instanceName).toBe('test-instance');
            expect(config.apiKey).toBe('test-key');
            expect(config.deploymentName).toBe('test-deployment');
            expect(config.apiVersion).toBe('2024-02-15-preview');
        });

        it('should have all required properties', () => {
            const config: AzureOpenAIConfig = {
                instanceName: 'instance',
                apiKey: 'key',
                deploymentName: 'deployment',
                apiVersion: 'version',
            };

            // TypeScript compilation ensures all required properties are present
            expect(typeof config.instanceName).toBe('string');
            expect(typeof config.apiKey).toBe('string');
            expect(typeof config.deploymentName).toBe('string');
            expect(typeof config.apiVersion).toBe('string');
        });

        it('should work with empty strings', () => {
            const config: AzureOpenAIConfig = {
                instanceName: '',
                apiKey: '',
                deploymentName: '',
                apiVersion: '',
            };

            expect(config.instanceName).toBe('');
            expect(config.apiKey).toBe('');
            expect(config.deploymentName).toBe('');
            expect(config.apiVersion).toBe('');
        });

        it('should be assignable to ModelConfig type', () => {
            const azureConfig: AzureOpenAIConfig = {
                instanceName: 'test-instance',
                apiKey: 'test-key',
                deploymentName: 'test-deployment',
                apiVersion: '2024-02-15-preview',
            };

            // This should compile without error
            const modelConfig: ModelConfig = azureConfig;
            expect(modelConfig).toBe(azureConfig);
        });
    });

    describe('ModelConfig type', () => {
        it('should be assignable from AzureOpenAIConfig', () => {
            const azureConfig: AzureOpenAIConfig = {
                instanceName: 'test-instance',
                apiKey: 'test-key',
                deploymentName: 'test-deployment',
                apiVersion: '2024-02-15-preview',
            };

            const modelConfig: ModelConfig = azureConfig;
            expect(modelConfig).toEqual(azureConfig);
        });

        it('should maintain type safety', () => {
            const createModelConfig = (config: ModelConfig): ModelConfig => {
                return config;
            };

            const azureConfig: AzureOpenAIConfig = {
                instanceName: 'test',
                apiKey: 'key',
                deploymentName: 'deployment',
                apiVersion: 'version',
            };

            const result = createModelConfig(azureConfig);
            expect(result).toBe(azureConfig);
        });
    });

    describe('Type Guards', () => {
        it('should work with custom type guard for AzureOpenAIConfig', () => {
            const isAzureOpenAIConfig = (config: any): config is AzureOpenAIConfig => {
                return (
                    typeof config === 'object' &&
                    config !== null &&
                    typeof config.instanceName === 'string' &&
                    typeof config.apiKey === 'string' &&
                    typeof config.deploymentName === 'string' &&
                    typeof config.apiVersion === 'string'
                );
            };

            const validConfig = {
                instanceName: 'test',
                apiKey: 'key',
                deploymentName: 'deployment',
                apiVersion: 'version',
            };

            const invalidConfig = {
                instanceName: 'test',
                apiKey: 'key',
                // missing deploymentName and apiVersion
            };

            expect(isAzureOpenAIConfig(validConfig)).toBe(true);
            expect(isAzureOpenAIConfig(invalidConfig)).toBe(false);
            expect(isAzureOpenAIConfig(null)).toBe(false);
            expect(isAzureOpenAIConfig(undefined)).toBe(false);
            expect(isAzureOpenAIConfig('string')).toBe(false);
        });
    });
});
