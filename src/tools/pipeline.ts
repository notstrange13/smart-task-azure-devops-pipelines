import { Tool } from './base';
import { ToolResult } from '../types';
import { PipelineClient } from '../clients/pipeline';
import * as tl from 'azure-pipelines-task-lib/task';

/**
 * Tool for getting pipeline variable values
 */
export class GetPipelineVariableTool extends Tool {
    name = 'get_pipeline_variable';
    description = 'Get the value of a pipeline variable by name';

    async execute(variableName: string): Promise<ToolResult> {
        try {
            const value = tl.getVariable(variableName);
            return {
                name: this.name,
                result: value || null,
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

/**
 * Tool for setting pipeline variables
 */
export class SetPipelineVariableTool extends Tool {
    name = 'set_pipeline_variable';
    description = 'Set a pipeline variable that can be used by subsequent tasks';

    async execute(input: string): Promise<ToolResult> {
        try {
            // Parse input - expecting JSON with name and value
            let parsedInput;

            // Handle case where input might already be an object
            if (typeof input === 'object' && input !== null) {
                parsedInput = input;
            } else if (typeof input === 'string') {
                try {
                    parsedInput = JSON.parse(input);
                } catch {
                    // If not JSON, treat as simple name=value format
                    const parts = input.split('=');
                    if (parts.length !== 2) {
                        return {
                            name: this.name,
                            result: null,
                            success: false,
                            error: 'Input must be JSON {"name": "varName", "value": "varValue"} or name=value format',
                        };
                    }
                    parsedInput = { name: parts[0].trim(), value: parts[1].trim() };
                }
            } else {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Input must be a string or object with name and value properties',
                };
            }

            const { name, value } = parsedInput;

            if (!name) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Variable name is required',
                };
            }

            console.log(`Setting pipeline variable: ${name} = ${value}`);

            // Set as pipeline variable for subsequent tasks
            tl.setVariable(name, value);

            // Also set as output variable
            tl.setVariable(name, value, false, true);

            return {
                name: this.name,
                result: { name, value },
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

/**
 * Tool for getting pipeline timeline
 */
export class GetPipelineTimelineTool extends Tool {
    name = 'get_pipeline_timeline';
    description = 'Get pipeline execution timeline and performance metrics';

    async execute(_input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');

            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const timeline = await PipelineClient.getPipelineTimeline(buildId);

            return {
                name: this.name,
                result: {
                    records: timeline.records || [],
                    lastChangedBy: timeline.lastChangedBy,
                    lastChangedOn: timeline.lastChangedOn,
                },
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
