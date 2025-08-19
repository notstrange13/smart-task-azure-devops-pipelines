// Load environment variables from .env file during development (if it exists)
if (process.env.NODE_ENV !== 'production') {
    try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '..', '.env');

        if (fs.existsSync(envPath)) {
            require('dotenv').config({ override: false });
            console.log('Development mode: loaded environment variables from .env file');
        } else {
            console.log('Development mode: no .env file found, using system environment variables');
        }
    } catch {
        console.log(
            'Development mode: dotenv not available or error loading, using system environment variables'
        );
    }
}

// Capture INPUT_ environment variables before task library import (in case it consumes them)
const inputPrompt = process.env.INPUT_PROMPT;
const inputMode = process.env.INPUT_MODE;
const inputAdditionalContext = process.env.INPUT_ADDITIONALCONTEXT;

import * as tl from 'azure-pipelines-task-lib/task';
import { Agent } from './agent';
import { TaskContext, ModelType, TaskMode } from './types';

async function run(): Promise<void> {
    try {
        console.log('Smart Task starting...');

        // Get task inputs with fallback for development environment
        const isDevMode = process.env.NODE_ENV === 'development';

        let prompt: string;
        let mode: TaskMode;
        let additionalContextInput: string;

        if (isDevMode) {
            // In development, use the captured environment variables
            prompt = inputPrompt || '';
            mode = inputMode as TaskMode;
            additionalContextInput = inputAdditionalContext || '{}';
        } else {
            // In production, use standard Azure DevOps task library methods
            prompt = tl.getInput('prompt', true) || '';
            mode = tl.getInput('mode', true) as TaskMode;
            additionalContextInput = tl.getInput('additionalContext', false) || '{}';
        }

        // Validate required inputs
        if (!prompt) {
            tl.setResult(tl.TaskResult.Failed, 'Prompt is required but was not provided');
            return;
        }

        if (!mode || !Object.values(TaskMode).includes(mode)) {
            tl.setResult(
                tl.TaskResult.Failed,
                `Mode is required and must be one of: ${Object.values(TaskMode).join(', ')}`
            );
            return;
        }

        console.log(`Smart Task starting in ${mode} mode...`);

        // Get model type from environment variable (defaults to Azure OpenAI)
        const modelTypeEnv = process.env.MODEL_TYPE || 'AZURE_OPENAI';
        const modelType =
            ModelType[modelTypeEnv as keyof typeof ModelType] || ModelType.AZURE_OPENAI;

        // Initialize model configuration based on model type
        let modelConfig: any;

        if (modelType === ModelType.AZURE_OPENAI) {
            const azureOpenAIInstanceName = process.env.AZURE_OPENAI_INSTANCE_NAME;
            const azureOpenAIKey = process.env.AZURE_OPENAI_KEY;
            const azureOpenAIDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
            const azureOpenAIApiVersion =
                process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

            if (!azureOpenAIInstanceName || !azureOpenAIKey || !azureOpenAIDeploymentName) {
                tl.setResult(
                    tl.TaskResult.Failed,
                    'Azure OpenAI configuration missing. Set AZURE_OPENAI_INSTANCE_NAME, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT_NAME environment variables.'
                );
                return;
            }

            modelConfig = {
                instanceName: azureOpenAIInstanceName,
                apiKey: azureOpenAIKey,
                deploymentName: azureOpenAIDeploymentName,
                apiVersion: azureOpenAIApiVersion,
            };
        } else {
            // Future model types can be added here
            // For example:
            // if (modelType === ModelType.ANTHROPIC) {
            //     const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
            //     if (!anthropicApiKey) {
            //         tl.setResult(tl.TaskResult.Failed, 'Anthropic configuration missing. Set ANTHROPIC_API_KEY environment variable.');
            //         return;
            //     }
            //     modelConfig = { apiKey: anthropicApiKey };
            // }

            tl.setResult(
                tl.TaskResult.Failed,
                `Unsupported model type: ${modelType}. Currently only AZURE_OPENAI is supported.`
            );
            return;
        }

        // Parse additional context
        let additionalContext: Record<string, any> = {};
        try {
            additionalContext = JSON.parse(additionalContextInput);
        } catch {
            // Use empty object if parsing fails
        }

        // Create task context
        const taskContext: TaskContext = {
            input: {
                prompt,
                mode,
                additionalContext,
            },
            config: {
                modelType,
                modelConfig,
            },
        };

        // Initialize and run the Smart Task Agent
        const agent = new Agent(taskContext);
        const result = await agent.execute();

        if (result.success) {
            console.log('Smart Task completed successfully');
        } else {
            tl.setResult(tl.TaskResult.Failed, result.error || 'Smart Task failed');
        }
    } catch (error) {
        tl.setResult(
            tl.TaskResult.Failed,
            `Smart Task failed: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

run();
