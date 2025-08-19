import { AzureChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { TaskConfig, ModelType, AzureOpenAIConfig } from '../../types';

/**
 * Factory for creating chat models based on configuration
 */
export class ModelFactory {
    /**
     * Creates a chat model instance based on the provided configuration
     */
    static createChatModel(config: TaskConfig): BaseChatModel {
        switch (config.modelType) {
            case ModelType.AZURE_OPENAI:
                return ModelFactory.createAzureOpenAIModel(config.modelConfig as AzureOpenAIConfig);

            // Future model types can be added here:
            // case ModelType.ANTHROPIC:
            //     return ModelFactory.createAnthropicModel(config.modelConfig as AnthropicConfig);
            // case ModelType.LOCAL_OLLAMA:
            //     return ModelFactory.createOllamaModel(config.modelConfig as OllamaConfig);

            default:
                throw new Error(`Unsupported model type: ${config.modelType}`);
        }
    }

    /**
     * Creates an Azure OpenAI chat model
     */
    private static createAzureOpenAIModel(config: AzureOpenAIConfig): BaseChatModel {
        return new AzureChatOpenAI({
            azureOpenAIApiKey: config.apiKey,
            azureOpenAIApiInstanceName: config.instanceName,
            azureOpenAIApiDeploymentName: config.deploymentName,
            azureOpenAIApiVersion: config.apiVersion,
            temperature: 0,
        });
    }

    // Future model creation methods can be added here:
    // private static createAnthropicModel(config: AnthropicConfig): BaseChatModel { ... }
    // private static createOllamaModel(config: OllamaConfig): BaseChatModel { ... }
}
