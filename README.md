# Smart Task for Azure DevOps Pipelines

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Azure DevOps](https://img.shields.io/badge/Azure%20DevOps-Extension-blue.svg)](https://azure.microsoft.com/en-us/services/devops/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-brightgreen.svg)](https://azure.microsoft.com/en-us/services/cognitive-services/openai-service/)

An intelligent Azure DevOps Pipeline task that brings AI-powered contextual awareness and dynamic decision-making to your CI/CD workflows. Built with LangChain, LangGraph, and Azure OpenAI.

## Why Smart Task?

Traditional pipeline tasks are static and require manual configuration for different scenarios. Smart Task revolutionizes this by:

- **AI-Driven Decisions**: Uses Azure OpenAI to analyze context and make intelligent choices
- **Adaptive Workflows**: Plan-execute-replan architecture that adapts based on results
- **Context Awareness**: Automatically gathers pipeline variables, file changes, and environment data
- **Rich Toolset**: 18+ specialized tools for comprehensive pipeline automation
- **Multiple Modes**: Decision-making and execution modes for different use cases

## Key Features

### Intelligent Decision Making
- Analyzes changed files, branch patterns, and context
- Sets pipeline variables dynamically based on AI analysis
- Supports conditional workflow execution

### Dynamic Execution
- Executes commands based on natural language prompts
- Real-time output streaming with professional formatting
- Comprehensive error handling and retry logic

### Comprehensive Toolset
- **File Operations**: Read, write, and analyze files
- **Pipeline Integration**: Variables, test results, build info
- **Version Control**: Git changes, commits, pull requests
- **Azure DevOps API**: Work items, artifacts, branch policies
- **System Operations**: Command execution, environment variables
- **Notifications**: Teams, email, and custom webhooks

### Advanced Workflows
- LangGraph-powered plan-execute-replan cycles
- Multi-provider AI model support (Azure OpenAI, OpenAI)
- Structured output with Zod validation
- Professional logging without emoji clutter

## 🏗️ Modular Architecture

Smart Task features a clean, maintainable architecture with tools organized into logical categories:

### Tools Organization
```
src/tools/
├── base.ts           # Abstract Tool class foundation
├── pipeline.ts       # Pipeline variables & timeline (3 tools)
├── filesystem.ts     # File operations (3 tools)
├── execution.ts      # Commands & environment (2 tools)
├── git.ts           # Git & source control (5 tools)
├── build.ts         # Build & testing tools (4 tools)
├── collaboration.ts # Notification tools (1 tool)
└── index.ts         # Factory function & exports
```

### Benefits
- **Maintainable**: Logical separation by functionality
- **Testable**: Individual tool files enable focused testing
- **Extensible**: Easy to add new tools in appropriate categories
- **Type-Safe**: Full TypeScript support with proper interfaces
- **Professional**: Enterprise-ready code organization
- **Modern Clients**: 5 specialized Azure DevOps API clients by domain

## Quick Start

### Prerequisites

- Azure DevOps organization
- Azure OpenAI service instance
- Node.js 16+ (for development)

### Installation

#### Option 1: From Azure DevOps Marketplace
*Coming soon - this extension will be published to the marketplace*

#### Option 2: Manual Installation
1. Clone this repository
2. Build and package the extension
3. Upload to your Azure DevOps organization

```bash
git clone https://github.com/pratikxpanda/smart-task-azure-devops-pipelines.git
cd smart-task-azure-devops-pipelines
npm install
npm run build
npm run package
```

### Basic Usage

```yaml
# Example: Smart test strategy decision
- task: SmartTask@1
  displayName: 'Determine Test Strategy'
  inputs:
    prompt: 'Analyze the changed files and determine which tests to run. Set appropriate variables for unit tests, integration tests, and e2e tests based on the changes.'
    mode: 'execution'
  env:
    AZURE_OPENAI_INSTANCE_NAME: 'your-openai-instance'
    AZURE_OPENAI_KEY: '$(AZURE_OPENAI_API_KEY)'
    AZURE_OPENAI_DEPLOYMENT_NAME: 'gpt-4o'

# Use the AI's decision
- task: PowerShell@2
  condition: eq(variables['RUN_UNIT_TESTS'], 'true')
  displayName: 'Run Unit Tests'
  inputs:
    script: 'npm test'
```

## Detailed Usage

### Configuration

#### Required Environment Variables
Set these as Azure DevOps pipeline variables (mark API key as secret):

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_INSTANCE_NAME` | Your Azure OpenAI instance name | `my-openai-instance` |
| `AZURE_OPENAI_KEY` | API key for authentication | `abc123...` (mark as secret) |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name | `gpt-4o` |
| `AZURE_OPENAI_API_VERSION` | API version (optional) | `2025-01-01-preview` |

#### Task Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | Yes | Natural language instruction for the AI |
| `mode` | choice | No | `execution` (default), `analysis`, or `planning` |

### Use Cases & Examples

#### 1. Smart Deployment Strategy
```yaml
- task: SmartTask@1
  displayName: 'Determine Deployment Strategy'
  inputs:
    prompt: |
      Based on the branch name, changed files, and current time:
      1. Determine the target environment (dev/staging/prod)
      2. Choose deployment strategy (blue-green/rolling/canary)
      3. Set appropriate variables for the deployment
    mode: 'execution'
```

#### 2. Conditional Test Execution
```yaml
- task: SmartTask@1
  displayName: 'Smart Test Selection'
  inputs:
    prompt: |
      Analyze the changed files in this PR:
      - If only documentation changed, skip all tests
      - If frontend files changed, run frontend tests
      - If backend files changed, run API tests
      - If database migrations changed, run integration tests
      Set variables accordingly.
    mode: 'execution'
```

#### 3. Intelligent Code Quality Checks
```yaml
- task: SmartTask@1
  displayName: 'Dynamic Code Quality'
  inputs:
    prompt: |
      Based on the changed files and their complexity:
      1. Determine which linting rules to apply
      2. Set security scan levels
      3. Choose appropriate test coverage thresholds
      4. Configure performance test requirements
    mode: 'execution'
```

#### 4. Release Notes Generation
```yaml
- task: SmartTask@1
  displayName: 'Generate Release Notes'
  inputs:
    prompt: |
      Generate release notes by:
      1. Analyzing commits since last release
      2. Categorizing changes (features, fixes, breaking)
      3. Writing user-friendly descriptions
      4. Creating changelog file
    mode: 'execution'
```

## Available Tools

The Smart Task comes with 18+ specialized tools:

### File & System Operations
- **ReadFileTool**: Read and analyze file contents
- **WriteFileTool**: Create or modify files
- **ListDirectoryTool**: Browse directory structures
- **ExecuteCommandTool**: Run shell commands with real-time output

### Pipeline Integration
- **GetPipelineVariableTool**: Access pipeline variables
- **SetPipelineVariableTool**: Set variables for downstream tasks
- **GetBuildInfoTool**: Retrieve build metadata
- **GetTestResultsTool**: Analyze test execution results

### Version Control
- **GetChangedFilesTool**: Identify modified files
- **GetCommitInfoTool**: Retrieve commit details
- **GetPullRequestInfoTool**: Access PR information

### Azure DevOps API
- **GetWorkItemsTool**: Query work items
- **CheckArtifactExistsTool**: Verify artifact availability
- **GetRepositoryInfoTool**: Repository metadata
- **GetBranchPolicyTool**: Branch protection rules
- **SendNotificationTool**: Teams/email notifications

### Environment
- **GetEnvironmentVariableTool**: Access environment variables
- **GetPipelineTimelineTool**: Pipeline execution timeline

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/pratikxpanda/smart-task-azure-devops-pipelines.git
cd smart-task-azure-devops-pipelines

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode with file watching
npm run build:watch
```

### Local Testing

The project includes a flexible development script:

#### CLI Arguments (Recommended)
```bash
# Basic execution test
node dev-test.js "List all files in the current directory" execution

# Decision-making test
node dev-test.js "Analyze the project structure and recommend a testing strategy" analysis

# Complex scenario
node dev-test.js "Based on package.json, determine if this is a web app or library and set appropriate build variables" execution
```

#### Environment Variables
```bash
# Set environment variables
export TEST_PROMPT="Your AI prompt here"
export TEST_MODE="execution"
node dev-test.js

# PowerShell
$env:TEST_PROMPT="Your AI prompt here"
$env:TEST_MODE="execution"
node dev-test.js
```

#### Environment File
Create `.env.test`:
```env
TEST_PROMPT=Analyze the project and suggest optimization strategies
TEST_MODE=analysis
```

Then load and run:
```powershell
Get-Content .env.test | ForEach-Object { 
    if ($_ -match '^([^#=]+)=(.*)$') { 
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2]) 
    } 
}
node dev-test.js
```

### Project Structure

```
smart-task-azure-devops-pipelines/
├── src/
│   ├── index.ts              # Main entry point
│   ├── agent.ts              # LangGraph agent orchestration
│   ├── tools.ts              # Tool implementations
│   ├── clients.ts            # Azure DevOps API clients
│   ├── types.ts              # TypeScript type definitions
│   └── task.json             # Azure DevOps task definition
├── dist/                     # Compiled output (auto-generated)
├── tests/                    # Jest test files
├── examples/                 # Example usage scenarios
├── dev-test.js               # Development testing script
├── vss-extension.json        # Extension manifest
└── package.json              # Dependencies and scripts
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript and copy task.json |
| `npm run build:watch` | Build with file watching |
| `npm run dev` | Build and run development test |
| `npm test` | Run Jest tests |
| `npm test:watch` | Run tests with file watching |
| `npm run lint` | ESLint code analysis |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run package` | Create `.vsix` extension package |
| `npm run clean` | Remove build artifacts |

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- agent.test.ts

# Watch mode for development
npm test:watch
```

### Integration Testing
```bash
# Test with real Azure DevOps environment
node dev-test.js "Integration test prompt" execution
```

## Building and Packaging

### CI/CD Pipeline

Create `.azure-pipelines.yml`:

```yaml
trigger:
- main
- feature/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  node_version: '18.x'

stages:
- stage: Build
  jobs:
  - job: BuildAndTest
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(node_version)'
      displayName: 'Install Node.js'

    - script: |
        npm ci
        npm run lint
        npm test
        npm run build
      displayName: 'Install, Lint, Test, and Build'

    - script: npm run package
      displayName: 'Package Extension'

    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '*.vsix'
        ArtifactName: 'extension'
      displayName: 'Publish Extension Artifact'

- stage: Deploy
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: PublishToMarketplace
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - script: |
              npx tfx extension publish --manifest-globs vss-extension.json --share-with your-org
            env:
              TFX_PUBLISHER_TOKEN: $(MARKETPLACE_TOKEN)
            displayName: 'Publish to Marketplace'
```

### Manual Package Creation

```bash
# Clean previous builds
npm run clean

# Install dependencies
npm ci

# Build the extension
npm run build

# Create package
npm run package

# The .vsix file will be created in the root directory
```

## Contributing

We welcome contributions! Here's how to get started:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Run linting: `npm run lint:fix`
7. Commit your changes: `git commit -m 'Add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Development Guidelines

#### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Write comprehensive JSDoc comments
- Maintain test coverage above 80%

#### Adding New Tools
1. Extend the `Tool` base class in `src/tools.ts`
2. Implement required methods: `name`, `description`, `execute`
3. Add comprehensive error handling
4. Write unit tests
5. Update documentation

#### Testing
- Write unit tests for all new functionality
- Include integration tests for Azure DevOps interactions
- Test error scenarios and edge cases
- Verify performance with large datasets

### Issue Reporting
When reporting issues, please include:
- Azure DevOps version
- Task configuration (sanitized)
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Community

### Getting Help
- **Documentation**: Check this README and inline code documentation
- **Issues**: [GitHub Issues](https://github.com/pratikxpanda/smart-task-azure-devops-pipelines/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pratikxpanda/smart-task-azure-devops-pipelines/discussions)

### Roadmap
- [ ] Azure DevOps Marketplace publication
- [ ] Support for additional AI providers (OpenAI, Anthropic)
- [ ] Advanced caching and performance optimization
- [ ] Webhook triggers for external events

## Acknowledgments

- **LangChain & LangGraph**: For the excellent AI orchestration framework
- **Azure OpenAI**: For providing powerful AI capabilities
- **Azure DevOps Team**: For the robust pipeline platform
- **Open Source Community**: For inspiration and contributions

---

**Made with care by [Pratik Panda](https://github.com/pratikxpanda)**

*Star this repository if you find it helpful!*
