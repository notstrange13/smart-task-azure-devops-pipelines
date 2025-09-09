import { ModelType, AzureOpenAIConfig } from '../types';

/**
 * Provides model configuration data
 */
export class ConfigProvider {
    /**
     * Gets and validates model configuration
     */
    getModelConfig(): { modelType: ModelType; modelConfig: AzureOpenAIConfig } {
        const modelType = this.getModelType();
        const modelConfig = this.createModelConfig(modelType);

        return { modelType, modelConfig };
    }

    /**
     * Gets model type from environment variable
     */
    private getModelType(): ModelType {
        const modelTypeEnv = process.env.MODEL_TYPE;

        if (!modelTypeEnv) {
            throw new Error('MODEL_TYPE environment variable is required. Set it to AZURE_OPENAI.');
        }

        const modelType = ModelType[modelTypeEnv as keyof typeof ModelType];
        if (!modelType) {
            throw new Error(
                `Invalid model type: ${modelTypeEnv}. Currently only AZURE_OPENAI is supported.`
            );
        }

        return modelType;
    }

    /**
     * Creates model configuration based on model type
     */
    private createModelConfig(modelType: ModelType): AzureOpenAIConfig {
        if (modelType === ModelType.AZURE_OPENAI) {
            return this.createAzureOpenAIConfig();
        }

        // Future model types can be added here:
        // if (modelType === ModelType.ANTHROPIC) {
        //     return this.createAnthropicConfig();
        // }

        throw new Error(
            `Unsupported model type: ${modelType}. Currently only AZURE_OPENAI is supported.`
        );
    }

    /**
     * Creates Azure OpenAI configuration from environment variables
     */
    private createAzureOpenAIConfig(): AzureOpenAIConfig {
        const instanceName = process.env.AZURE_OPENAI_INSTANCE_NAME;
        const apiKey = process.env.AZURE_OPENAI_KEY;
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

        if (!instanceName || !apiKey || !deploymentName || !apiVersion) {
            throw new Error(
                'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_VERSION environment variables.'
            );
        }

        return {
            instanceName,
            apiKey,
            deploymentName,
            apiVersion,
        };
    }

    // Future model configuration methods can be added here:
    // private createAnthropicConfig(): AnthropicConfig { ... }
    // private createOllamaConfig(): OllamaConfig { ... }
}
