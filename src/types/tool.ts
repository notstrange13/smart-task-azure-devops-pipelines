// Tool execution result interface
export interface ToolResult {
    name: string;
    result: any;
    success: boolean;
    error?: string;
}
