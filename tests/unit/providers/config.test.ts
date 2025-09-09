import { ConfigProvider } from '../../../src/providers/config';
import { ModelType } from '../../../src/types';

describe('ConfigProvider', () => {
    let configProvider: ConfigProvider;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        configProvider = new ConfigProvider();
        // Store original environment variables
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        // Restore original environment variables
        process.env = originalEnv;
    });

    describe('getModelConfig', () => {
        it('should return valid model configuration for AZURE_OPENAI', () => {
            // Arrange
            process.env.MODEL_TYPE = 'AZURE_OPENAI';
            process.env.AZURE_OPENAI_INSTANCE_NAME = 'test-instance';
            process.env.AZURE_OPENAI_KEY = 'test-key';
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
            process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

            // Act
            const result = configProvider.getModelConfig();

            // Assert
            expect(result.modelType).toBe(ModelType.AZURE_OPENAI);
            expect(result.modelConfig).toEqual({
                instanceName: 'test-instance',
                apiKey: 'test-key',
                deploymentName: 'test-deployment',
                apiVersion: '2024-02-15-preview',
            });
        });

        it('should throw error when MODEL_TYPE is not set', () => {
            // Arrange
            delete process.env.MODEL_TYPE;

            // Act & Assert
            expect(() => configProvider.getModelConfig()).toThrow(
                'MODEL_TYPE environment variable is required. Set it to AZURE_OPENAI.'
            );
        });

        it('should throw error when MODEL_TYPE is invalid', () => {
            // Arrange
            process.env.MODEL_TYPE = 'INVALID_TYPE';

            // Act & Assert
            expect(() => configProvider.getModelConfig()).toThrow(
                'Invalid model type: INVALID_TYPE. Currently only AZURE_OPENAI is supported.'
            );
        });
    });

    describe('getModelType', () => {
        it('should return AZURE_OPENAI when environment variable is set correctly', () => {
            // Arrange
            process.env.MODEL_TYPE = 'AZURE_OPENAI';

            // Act
            const result = (configProvider as any).getModelType();

            // Assert
            expect(result).toBe(ModelType.AZURE_OPENAI);
        });

        it('should throw error when MODEL_TYPE environment variable is missing', () => {
            // Arrange
            delete process.env.MODEL_TYPE;

            // Act & Assert
            expect(() => (configProvider as any).getModelType()).toThrow(
                'MODEL_TYPE environment variable is required. Set it to AZURE_OPENAI.'
            );
        });

        it('should throw error when MODEL_TYPE is empty string', () => {
            // Arrange
            process.env.MODEL_TYPE = '';

            // Act & Assert
            expect(() => (configProvider as any).getModelType()).toThrow(
                'MODEL_TYPE environment variable is required. Set it to AZURE_OPENAI.'
            );
        });

        it('should throw error when MODEL_TYPE is unsupported', () => {
            // Arrange
            process.env.MODEL_TYPE = 'ANTHROPIC';

            // Act & Assert
            expect(() => (configProvider as any).getModelType()).toThrow(
                'Invalid model type: ANTHROPIC. Currently only AZURE_OPENAI is supported.'
            );
        });
    });

    describe('createModelConfig', () => {
        it('should create Azure OpenAI config when model type is AZURE_OPENAI', () => {
            // Arrange
            process.env.AZURE_OPENAI_INSTANCE_NAME = 'test-instance';
            process.env.AZURE_OPENAI_KEY = 'test-key';
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
            process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

            // Act
            const result = (configProvider as any).createModelConfig(ModelType.AZURE_OPENAI);

            // Assert
            expect(result).toEqual({
                instanceName: 'test-instance',
                apiKey: 'test-key',
                deploymentName: 'test-deployment',
                apiVersion: '2024-02-15-preview',
            });
        });
    });

    describe('createAzureOpenAIConfig', () => {
        it('should create valid Azure OpenAI configuration with all environment variables', () => {
            // Arrange
            process.env.AZURE_OPENAI_INSTANCE_NAME = 'my-openai-instance';
            process.env.AZURE_OPENAI_KEY = 'sk-1234567890abcdef';
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'gpt-4-deployment';
            process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

            // Act
            const result = (configProvider as any).createAzureOpenAIConfig();

            // Assert
            expect(result).toEqual({
                instanceName: 'my-openai-instance',
                apiKey: 'sk-1234567890abcdef',
                deploymentName: 'gpt-4-deployment',
                apiVersion: '2024-02-15-preview',
            });
        });

        it('should throw error when AZURE_OPENAI_INSTANCE_NAME is missing', () => {
            // Arrange
            delete process.env.AZURE_OPENAI_INSTANCE_NAME;
            process.env.AZURE_OPENAI_KEY = 'test-key';
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
            process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

            // Act & Assert
            expect(() => (configProvider as any).createAzureOpenAIConfig()).toThrow(
                'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_VERSION environment variables.'
            );
        });

        it('should throw error when AZURE_OPENAI_KEY is missing', () => {
            // Arrange
            process.env.AZURE_OPENAI_INSTANCE_NAME = 'test-instance';
            delete process.env.AZURE_OPENAI_KEY;
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
            process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

            // Act & Assert
            expect(() => (configProvider as any).createAzureOpenAIConfig()).toThrow(
                'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_VERSION environment variables.'
            );
        });

        it('should throw error when AZURE_OPENAI_DEPLOYMENT_NAME is missing', () => {
            // Arrange
            process.env.AZURE_OPENAI_INSTANCE_NAME = 'test-instance';
            process.env.AZURE_OPENAI_KEY = 'test-key';
            delete process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
            process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

            // Act & Assert
            expect(() => (configProvider as any).createAzureOpenAIConfig()).toThrow(
                'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_VERSION environment variables.'
            );
        });

        it('should throw error when AZURE_OPENAI_API_VERSION is missing', () => {
            // Arrange
            process.env.AZURE_OPENAI_INSTANCE_NAME = 'test-instance';
            process.env.AZURE_OPENAI_KEY = 'test-key';
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
            delete process.env.AZURE_OPENAI_API_VERSION;

            // Act & Assert
            expect(() => (configProvider as any).createAzureOpenAIConfig()).toThrow(
                'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_VERSION environment variables.'
            );
        });

        it('should throw error when all Azure OpenAI environment variables are missing', () => {
            // Arrange
            delete process.env.AZURE_OPENAI_INSTANCE_NAME;
            delete process.env.AZURE_OPENAI_KEY;
            delete process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
            delete process.env.AZURE_OPENAI_API_VERSION;

            // Act & Assert
            expect(() => (configProvider as any).createAzureOpenAIConfig()).toThrow(
                'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_VERSION environment variables.'
            );
        });

        it('should throw error when environment variables are empty strings', () => {
            // Arrange
            process.env.AZURE_OPENAI_INSTANCE_NAME = '';
            process.env.AZURE_OPENAI_KEY = 'test-key';
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
            process.env.AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

            // Act & Assert
            expect(() => (configProvider as any).createAzureOpenAIConfig()).toThrow(
                'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_VERSION environment variables.'
            );
        });
    });
});
