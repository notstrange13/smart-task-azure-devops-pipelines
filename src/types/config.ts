// Model Type enum
export enum ModelType {
    AZURE_OPENAI = 'azure_openai',
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
