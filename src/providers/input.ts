// Import this BEFORE the task library to capture INPUT_ variables
import { capturedInputs } from './inputCapture';
import * as tl from 'azure-pipelines-task-lib/task';
import { TaskMode } from '../types';

/**
 * Provides input data and validation for the task
 */
export class InputProvider {
    private isDevMode: boolean;

    constructor() {
        this.isDevMode = process.env.NODE_ENV === 'development';
    }

    /**
     * Gets and validates all task inputs
     */
    getTaskInputs(): { prompt: string; mode: TaskMode; additionalContext: Record<string, any> } {
        const { prompt, mode, additionalContextInput } = this.getRawInputs();

        this.validateInputs(prompt, mode);

        const additionalContext = this.parseAdditionalContext(additionalContextInput);

        return { prompt, mode, additionalContext };
    }

    /**
     * Gets raw inputs from either development environment or Azure DevOps task library
     */
    private getRawInputs(): { prompt: string; mode: TaskMode; additionalContextInput: string } {
        if (this.isDevMode) {
            return {
                prompt: capturedInputs.prompt || '',
                mode: capturedInputs.mode as TaskMode,
                additionalContextInput: capturedInputs.additionalContext || '{}',
            };
        } else {
            return {
                prompt: tl.getInput('prompt', true) || '',
                mode: tl.getInput('mode', true) as TaskMode,
                additionalContextInput: tl.getInput('additionalContext', false) || '{}',
            };
        }
    }

    /**
     * Validates required inputs
     */
    private validateInputs(prompt: string, mode: TaskMode): void {
        if (!prompt) {
            throw new Error('Prompt is required but was not provided');
        }

        if (!mode || !Object.values(TaskMode).includes(mode)) {
            throw new Error(
                `Mode is required and must be one of: ${Object.values(TaskMode).join(', ')}`
            );
        }
    }

    /**
     * Parses additional context JSON string
     */
    private parseAdditionalContext(additionalContextInput: string): Record<string, any> {
        try {
            return JSON.parse(additionalContextInput);
        } catch {
            return {};
        }
    }
}
