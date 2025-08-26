# Smart Task for Azure DevOps Pipelines

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

An intelligent Azure DevOps Pipeline task that brings AI-powered decision-making to your CI/CD workflows. Built with LangChain, LangGraph, and Azure OpenAI.

## Features

- **AI-Driven Decisions**: Analyzes context and makes intelligent pipeline choices
- **Dynamic Execution**: Executes commands based on natural language prompts
- **Rich Toolset**: 18+ specialized tools for comprehensive pipeline automation
- **Context Awareness**: Automatically gathers pipeline variables, file changes, and environment data
- **Plan-Execute-Replan**: Adaptive workflows that adjust based on results

## Quick Start

### Prerequisites

- Azure DevOps organization
- Azure OpenAI service instance
- Node.js 18+

### Installation

1. Clone this repository:

```bash
git clone https://github.com/pratikxpanda/smart-task-azure-devops-pipelines.git
cd smart-task-azure-devops-pipelines
npm install
npm run build
```

2. Package and install in Azure DevOps:

```bash
npm run package
# Upload the generated .vsix file to your Azure DevOps organization
```

### Usage

```yaml
- task: SmartTask@1
  displayName: 'Smart Pipeline Task'
  inputs:
    prompt: 'Analyze changed files and set appropriate test variables'
    mode: 'execution'
  env:
    MODEL_TYPE: 'AZURE_OPENAI'
    AZURE_OPENAI_INSTANCE_NAME: 'your-openai-instance'
    AZURE_OPENAI_KEY: '$(AZURE_OPENAI_API_KEY)'
    AZURE_OPENAI_DEPLOYMENT_NAME: 'gpt-4o'
    AZURE_OPENAI_API_VERSION: '2025-01-01-preview'
```

### Configuration

Set these as Azure DevOps pipeline variables:

| Variable                       | Description                     | Required |
| ------------------------------ | ------------------------------- | -------- |
| `MODEL_TYPE`                   | AI model type (AZURE_OPENAI)    | Yes      |
| `AZURE_OPENAI_INSTANCE_NAME`   | Your Azure OpenAI instance name | Yes      |
| `AZURE_OPENAI_KEY`             | API key for authentication      | Yes      |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name           | Yes      |
| `AZURE_OPENAI_API_VERSION`     | API version                     | Yes      |

## Development

### Setup

```bash
git clone https://github.com/pratikxpanda/smart-task-azure-devops-pipelines.git
cd smart-task-azure-devops-pipelines
npm install
npm run build
```

### Testing

```bash
# Run tests
npm test

# Local testing with development script
node scripts/dev-test.js "Your prompt here" execution
```

### Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run build`   | Compile TypeScript       |
| `npm test`        | Run tests                |
| `npm run lint`    | Run linter               |
| `npm run package` | Create extension package |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Run linting: `npm run lint:fix`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made by [Pratik Panda](https://github.com/pratikxpanda)**
