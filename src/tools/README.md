# Smart Task Tools

This folder contains all the tools available to the Smart Task Azure DevOps Pipeline extension. Tools are organized by category for better maintainability and understanding.

## 📁 Folder Structure

```
tools/
├── base.ts              # Abstract base Tool class
├── index.ts             # Main exports and tool factory
├── pipeline.ts          # Pipeline variables & timeline (3 tools)
├── filesystem.ts        # File operations (3 tools)
├── execution.ts         # Commands & environment (2 tools)
├── git.ts              # Git & source control (4 tools)
├── build.ts            # Build & testing tools (5 tools)
└── notification.ts     # Notification tools (1 tool)
```

## 🔧 Tool Categories

### Pipeline & Environment (`pipeline.ts`)
- **GetPipelineVariableTool**: Get pipeline variable values
- **SetPipelineVariableTool**: Set pipeline variables for subsequent tasks
- **GetPipelineTimelineTool**: Get pipeline execution timeline and performance metrics

### File System (`filesystem.ts`)
- **ReadFileTool**: Read file contents
- **WriteFileTool**: Write content to files
- **ListDirectoryTool**: List directory contents with metadata

### Command Execution & Environment (`execution.ts`)
- **ExecuteCommandTool**: Execute shell commands with real-time output
- **GetEnvironmentVariableTool**: Get system environment variable values

### Git & Source Control (`git.ts`)
- **GetCommitInfoTool**: Get detailed commit information
- **GetPullRequestInfoTool**: Get PR information if applicable
- **GetRepositoryInfoTool**: Get repository statistics
- **GetBranchPolicyTool**: Get branch policies

### Build & Testing (`build.ts`)
- **GetBuildChangesTool**: Get files changed in the current build
- **GetBuildInfoTool**: Get detailed build information
- **GetTestResultsTool**: Get test results for current build
- **CheckArtifactExistsTool**: Check if specific artifacts exist
- **GetBuildWorkItemsTool**: Get work items associated with current build

### Notification (`notification.ts`)
- **SendNotificationTool**: Send email notifications with build information

## 🏗️ Architecture

### Base Tool Class
All tools inherit from the abstract `Tool` class:

```typescript
abstract class Tool {
    abstract name: string;
    abstract description: string;
    abstract execute(input: string): Promise<ToolResult>;
}
```

### Tool Factory
Use `createAllTools()` to get all available tools:

```typescript
import { createAllTools } from './tools';

const tools = createAllTools();
```

## 🧪 Testing

Each tool file should have corresponding tests:

```
tests/
└── tools/
    ├── pipeline.test.ts
    ├── filesystem.test.ts
    ├── execution.test.ts
    ├── git.test.ts
    ├── build.test.ts
    └── notification.test.ts
```

## 📝 Adding New Tools

1. **Choose appropriate category** or create a new file
2. **Implement the Tool interface**:
   ```typescript
   export class MyNewTool extends Tool {
       name = 'my_new_tool';
       description = 'Description of what it does';
       
       async execute(input: string): Promise<ToolResult> {
           // Implementation
       }
   }
   ```
3. **Export from category file**
4. **Add to index.ts exports and createAllTools()**
5. **Write tests**
6. **Update documentation**

## 🔄 Tool Result Format

All tools return a standardized `ToolResult`:

```typescript
interface ToolResult {
    name: string;           // Tool name
    result: any;           // Tool output data
    success: boolean;      // Execution success
    error?: string;        // Error message if failed
}
```

## 🎯 Best Practices

- **Single Responsibility**: Each tool does one thing well
- **Error Handling**: Always wrap in try-catch and return proper errors
- **Logging**: Use console.log for user-facing output
- **Input Validation**: Validate inputs before processing
- **Documentation**: Include JSDoc comments for all public methods
- **Testing**: Write unit tests for each tool

## 🔧 Maintenance

- Keep tools focused and small
- Update documentation when adding features
- Group related functionality together
- Use consistent naming conventions
- Follow TypeScript best practices
