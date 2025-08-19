# Types

This folder contains all TypeScript type definitions organized by domain for better maintainability and understanding.

## Structure

```
types/
├── index.ts       # Main exports - import all types from here
├── task.ts        # Core task types (TaskInput, TaskResult, TaskContext, etc.)
├── model.ts       # AI model configuration types (ModelType, AzureOpenAIConfig, etc.)
├── agent.ts       # Agent execution state types (PlanExecuteState, StateAnnotation, etc.)
├── tool.ts        # Tool-related types (ToolResult, etc.)
└── README.md      # This file
```

## Usage

### Import all types (recommended)

```typescript
import { TaskInput, TaskResult, ToolResult, PlanExecuteState } from '../types';
```

### Import from specific modules (for clarity)

```typescript
import { TaskInput, TaskResult } from '../types/task';
import { ToolResult } from '../types/tool';
import { PlanExecuteState } from '../types/agent';
import { ModelType, AzureOpenAIConfig } from '../types/model';
```

## Type Categories

### Task Types (`task.ts`)

Core types for task configuration, input, and output:

- `TaskMode` - Enum for execution/decision modes
- `TaskInput` - User input and configuration
- `TaskResult` - Task execution results
- `TaskContext` - Complete task context
- `TaskConfig` - Task configuration

### Model Types (`model.ts`)

AI model configuration types:

- `ModelType` - Enum for supported model types
- `AzureOpenAIConfig` - Azure OpenAI configuration
- `ModelConfig` - Union of all model configurations

### Agent Types (`agent.ts`)

LangGraph agent execution state types:

- `PlanExecuteState` - Main state for plan-execute workflow
- `Plan`, `Response`, `Action` - Action schemas
- `StateAnnotation` - LangGraph state annotation
- Zod schemas for validation

### Tool Types (`tool.ts`)

Tool execution and result types:

- `ToolResult` - Standardized tool execution result
- `ToolResultSchema` - Zod schema for validation

## Adding New Types

1. **Choose the appropriate module** based on the type's domain
2. **Add the type definition** with proper JSDoc comments
3. **Export from the module** file
4. **Add to index.ts** if it should be part of the main API
5. **Update this README** if adding a new category

## Validation

All types that need runtime validation include corresponding Zod schemas:

- `PlanExecuteStateSchema`
- `ToolResultSchema`
- Action schemas (`PlanSchema`, `ResponseSchema`, `ActionSchema`)

These schemas ensure type safety at runtime and provide validation for external inputs.
