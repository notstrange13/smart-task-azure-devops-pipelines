import { ToolResult } from '../types';

/**
 * Abstract base class for all tools
 * Provides the interface that all tools must implement
 */
export abstract class Tool {
    abstract name: string;
    abstract description: string;
    abstract execute(input: string): Promise<ToolResult>;
}
