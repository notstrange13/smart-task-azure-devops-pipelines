// Export base tool class
export { Tool } from './base';

// Export pipeline-related tools
export {
    GetPipelineVariableTool,
    SetPipelineVariableTool,
    GetPipelineTimelineTool
} from './pipeline';

// Export filesystem tools
export {
    ReadFileTool,
    WriteFileTool,
    ListDirectoryTool
} from './filesystem';

// Export execution tools
export { 
    ExecuteCommandTool,
    GetEnvironmentVariableTool 
} from './execution';

// Export Git/source control tools
export {
    GetCommitInfoTool,
    GetPullRequestInfoTool,
    GetRepositoryInfoTool,
    GetBranchPolicyTool
} from './git';

// Export build-related tools
export {
    GetBuildChangesTool,
    GetBuildInfoTool,
    GetTestResultsTool,
    CheckArtifactExistsTool,
    GetBuildWorkItemsTool
} from './build';

// Export notification tools
export {
    SendNotificationTool
} from './notification';

// Export all tools as an array for easy registration
import { Tool } from './base';
import {
    GetPipelineVariableTool,
    SetPipelineVariableTool,
    GetPipelineTimelineTool
} from './pipeline';
import {
    ReadFileTool,
    WriteFileTool,
    ListDirectoryTool
} from './filesystem';
import { 
    ExecuteCommandTool,
    GetEnvironmentVariableTool 
} from './execution';
import {
    GetCommitInfoTool,
    GetPullRequestInfoTool,
    GetRepositoryInfoTool,
    GetBranchPolicyTool
} from './git';
import {
    GetBuildChangesTool,
    GetBuildInfoTool,
    GetTestResultsTool,
    CheckArtifactExistsTool,
    GetBuildWorkItemsTool
} from './build';
import {
    SendNotificationTool
} from './notification';

/**
 * Factory function to create all available tools
 * @returns Array of all tool instances
 */
export function createAllTools(): Tool[] {
    return [
        // Pipeline Tools
        new GetPipelineVariableTool(),
        new SetPipelineVariableTool(),
        new GetPipelineTimelineTool(),
        
        // File System Tools
        new ReadFileTool(),
        new WriteFileTool(),
        new ListDirectoryTool(),
        
        // Execution & Environment Tools
        new ExecuteCommandTool(),
        new GetEnvironmentVariableTool(),
        
        // Git/Source Control Tools
        new GetCommitInfoTool(),
        new GetPullRequestInfoTool(),
        new GetRepositoryInfoTool(),
        new GetBranchPolicyTool(),
        
        // Build Tools
        new GetBuildChangesTool(),
        new GetBuildInfoTool(),
        new GetTestResultsTool(),
        new CheckArtifactExistsTool(),
        new GetBuildWorkItemsTool(),
        
        // Notification Tools
        new SendNotificationTool()
    ];
}

/**
 * Tool categories for better organization
 */
export const ToolCategories = {
    PIPELINE: 'Pipeline & Environment',
    FILESYSTEM: 'File System',
    EXECUTION: 'Command Execution',
    GIT: 'Git & Source Control',
    BUILD: 'Build & Testing',
    NOTIFICATION: 'Notification'
} as const;
