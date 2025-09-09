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

#### Intelligent Test Strategy Task

```yaml
- task: SmartTask@1
  name: SmartDecision
  displayName: 'AI Decision: Intelligent Test Strategy'
  env:
    MODEL_TYPE: $(MODEL_TYPE)
    AZURE_OPENAI_INSTANCE_NAME: $(AZURE_OPENAI_INSTANCE_NAME)
    AZURE_OPENAI_KEY: $(AZURE_OPENAI_KEY)
    AZURE_OPENAI_DEPLOYMENT_NAME: $(AZURE_OPENAI_DEPLOYMENT_NAME)
    AZURE_OPENAI_API_VERSION: $(AZURE_OPENAI_API_VERSION)
  inputs:
    prompt: |
      Analyze this repository and the current build context to make intelligent testing decisions:

      1. **Analyze the codebase structure:**
         - Examine package.json to understand the project type and dependencies
         - Determine if this is a frontend, backend, or full-stack project
         - Identify testing frameworks and scripts available

      2. **Analyze the build context:**
         - Check the source branch to understand the type of changes (feature, hotfix, main/master)
         - Consider the build trigger reason (manual, pull request, scheduled, etc.)
         - Evaluate the scope and risk level of changes

      3. **Make intelligent testing decisions:**
         - For main/master branch: Run comprehensive test suite for maximum confidence
         - For feature branches: Run targeted tests based on likely impact areas
         - For hotfix branches: Focus on critical path testing for fast feedback
         - For dependency updates: Emphasize integration and compatibility tests

      4. **Set pipeline variables for the test execution strategy:**
         - RUN_UNIT_TESTS: true/false (for build stage)
         - RUN_INTEGRATION_TESTS: true/false (for deploy stage)
         - RUN_E2E_TESTS: true/false (for deploy stage)
         - TEST_SCOPE: 'minimal' | 'standard' | 'comprehensive'
         - TEST_REASON: clear explanation of the testing strategy decision

      Make data-driven decisions to optimize test execution time while maintaining appropriate quality gates.

    mode: 'decision'
    additionalContext: |
      {
        "project_context": {
          "type": "web_application",
          "environments": ["development", "staging", "production"],
          "test_types": ["unit", "integration", "e2e", "performance"],
          "pipeline_stages": ["build", "deploy"]
        },
        "decision_criteria": {
          "main_branch": "comprehensive testing required",
          "feature_branch": "targeted testing based on changes",
          "hotfix_branch": "critical path testing only",
          "scheduled_build": "full regression testing"
        },
        "stage_strategy": {
          "build_stage": "fast feedback with unit tests",
          "deploy_stage": "comprehensive validation with integration and e2e tests"
        }
      }
```

#### Smart Deployment Decision

```yaml
- task: SmartTask@1
  displayName: 'Smart Deployment Decision'
  inputs:
    prompt: |
      Analyze the current build and deployment context:
      
      1. Check if this is a production deployment
      2. Verify all tests have passed
      3. Determine the appropriate deployment strategy
      4. Execute deployment commands if conditions are met
      
      For production: Use blue-green deployment
      For staging: Use rolling deployment
      For development: Use direct deployment
    mode: 'execution'
  env:
    MODEL_TYPE: '$(MODEL_TYPE)'
    AZURE_OPENAI_INSTANCE_NAME: '$(AZURE_OPENAI_INSTANCE_NAME)'
    AZURE_OPENAI_KEY: '$(AZURE_OPENAI_KEY)'
    AZURE_OPENAI_DEPLOYMENT_NAME: '$(AZURE_OPENAI_DEPLOYMENT_NAME)'
    AZURE_OPENAI_API_VERSION: '$(AZURE_OPENAI_API_VERSION)'
```

#### Security Scanning Strategy

```yaml
- task: SmartTask@1
  inputs:
    prompt: |
      Determine security scanning strategy based on code changes and deployment context:
      
      1. Analyze recent code changes to identify security-relevant modifications
      2. Check if dependencies have been updated or added
      3. Evaluate authentication/authorization code changes
      4. Consider the target deployment environment and compliance requirements
      5. Set appropriate scanning variables: SECURITY_SCAN_TYPE, SCAN_SCOPE, COMPLIANCE_CHECK
      
      Optimize scanning time while ensuring adequate security coverage.
    mode: 'decision'
    additionalContext: |
      {
        "deployment_context": {
          "target_environment": "$(DEPLOYMENT_ENVIRONMENT)",
          "compliance_requirements": ["SOC2", "GDPR"],
          "security_baseline": "enterprise"
        },
        "scanning_strategies": {
          "full_scan": "comprehensive security analysis - use for production deployments",
          "incremental_scan": "focus on changed files and dependencies - use for development",
          "dependency_scan": "focus on new/updated dependencies - use for dependency updates",
          "compliance_scan": "focus on regulatory compliance - use for production releases"
        },
        "risk_factors": {
          "production_deployment": "high risk - requires comprehensive scanning",
          "dependency_changes": "medium risk - focus on supply chain security",
          "auth_changes": "high risk - requires authentication security review"
        }
      }
  env:
    MODEL_TYPE: $(MODEL_TYPE)
    AZURE_OPENAI_INSTANCE_NAME: $(AZURE_OPENAI_INSTANCE_NAME)
    AZURE_OPENAI_KEY: $(AZURE_OPENAI_KEY)
    AZURE_OPENAI_DEPLOYMENT_NAME: $(AZURE_OPENAI_DEPLOYMENT_NAME)
    AZURE_OPENAI_API_VERSION: $(AZURE_OPENAI_API_VERSION)
```

### Configuration

Set these as Azure DevOps pipeline variables or in a variable group:

| Variable                       | Description                     | Required | Example                    |
| ------------------------------ | ------------------------------- | -------- | -------------------------- |
| `MODEL_TYPE`                   | AI model type                  | Yes      | `AZURE_OPENAI`            |
| `AZURE_OPENAI_INSTANCE_NAME`   | Your Azure OpenAI instance name | Yes      | `my-openai-instance`      |
| `AZURE_OPENAI_KEY`             | API key for authentication      | Yes      | `$(AZURE_OPENAI_API_KEY)` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name           | Yes      | `gpt-4o`                  |
| `AZURE_OPENAI_API_VERSION`     | API version                     | Yes      | `2025-01-01-preview`      |

### Task Modes

Smart Task supports two execution modes:

#### Decision Mode (`mode: 'decision'`)
- **Purpose**: Analyze context and set pipeline variables for conditional execution
- **Use Cases**: 
  - Intelligent test strategy decisions
  - Environment-specific deployment choices
  - Security scanning optimization
  - Resource allocation decisions
- **Output**: Sets pipeline variables that other tasks can use
- **Example Variables**: `RUN_UNIT_TESTS`, `DEPLOYMENT_STRATEGY`, `SECURITY_LEVEL`

#### Execution Mode (`mode: 'execution'`)
- **Purpose**: Execute commands and perform actions based on AI analysis
- **Use Cases**:
  - Automated deployments
  - Dynamic script execution  
  - File operations
  - API calls and integrations
- **Output**: Executes commands and reports results
- **Tools Available**: All 18+ specialized tools for comprehensive automation

### Available Tools

Smart Task includes 18+ specialized tools for comprehensive pipeline automation:

| Category | Tools | Description |
|----------|-------|-------------|
| **File System** | `read_file`, `write_file`, `list_directory` | File and directory operations |
| **Git Operations** | `get_commit_changes`, `get_repository_info` | Git repository analysis |
| **Pipeline Context** | `get_pipeline_variables`, `set_pipeline_variable` | Azure DevOps pipeline integration |
| **Build Tools** | `execute_command`, `run_tests`, `build_application` | Build and test execution |
| **Notifications** | `send_notification`, `create_work_item` | Team communication |
| **Environment** | `check_environment`, `validate_configuration` | Environment validation |

### Best Practices

1. **Use Decision Mode for Strategy**: Use decision mode to set variables that control subsequent pipeline steps
2. **Provide Context**: Include relevant context in `additionalContext` to help AI make better decisions
3. **Be Specific in Prompts**: Clear, specific prompts lead to better AI decisions
4. **Use Variable Groups**: Store AI configuration in Azure DevOps variable groups for reusability
5. **Test Incrementally**: Start with simple prompts and gradually increase complexity

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
