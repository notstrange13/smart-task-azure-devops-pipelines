# Smart Task Clients

This folder contains specialized clients for different Azure DevOps services. Each client is focused on a specific domain and provides a clean, typed interface for interacting with Azure DevOps APIs.

## 📁 Folder Structure

```
clients/
├── base.ts           # Abstract base client with common functionality
├── index.ts          # Main exports and client factory
├── build.ts          # Build & artifact operations
├── git.ts            # Git & source control operations
├── pipeline.ts       # Pipeline execution & timeline
└── notification.ts   # Notifications & alerts
```

## 🔧 Client Categories

### Base Client (`base.ts`)
- **BaseAzureDevOpsClient**: Abstract base class with common functionality
  - Authentication handling
  - Base URL construction
  - Generic request method
  - Helper methods for common pipeline variables

### Build Operations (`build.ts`)
- **BuildClient**: Build and artifact management
  - `getBuildInfo()`: Get detailed build information
  - `getTestResults()`: Get test results for builds
  - `getArtifacts()`: Get build artifacts
  - `getBuildChanges()`: Get changes in a build
  - `getBuildWorkItems()`: Get work items associated with builds

### Git & Source Control (`git.ts`)
- **GitClient**: Git repository operations
  - `getCommitInfo()`: Get commit details
  - `getCommitChanges()`: Get files changed in commits
  - `getPullRequest()`: Get pull request information
  - `getRepository()`: Get repository metadata
  - `getBranchPolicies()`: Get branch protection policies
  - `getBranches()`: Get repository branches
  - `getTags()`: Get repository tags

### Pipeline Execution (`pipeline.ts`)
- **PipelineClient**: Pipeline management and execution
  - `getPipelineTimeline()`: Get execution timeline and metrics
  - `getPipelineDefinition()`: Get pipeline configuration
  - `getPipelineRuns()`: Get pipeline run history
  - `getPipelineVariables()`: Get pipeline variables
  - `getPipelineLogs()`: Get pipeline logs
  - `getLogContent()`: Get specific log content

### Notifications & Alerts (`notification.ts`)
- **NotificationClient**: Send notifications and manage subscriptions
  - `sendTeamsNotification()`: Send Microsoft Teams messages
  - `sendSlackNotification()`: Send Slack messages
  - `sendEmailNotification()`: Send email notifications
  - `getNotificationSubscriptions()`: Get user subscriptions
  - `createNotificationSubscription()`: Create new subscriptions

## 🏗️ Architecture

### Base Client Pattern
All clients inherit from `BaseAzureDevOpsClient` which provides:

```typescript
abstract class BaseAzureDevOpsClient {
    protected static getAuthHeader(): string;
    protected static getBaseUrl(): string;
    protected static makeRequest(endpoint: string, method?: string, body?: any): Promise<any>;
    protected static getBuildId(): string;
    protected static getRepositoryId(): string;
    protected static getSourceVersion(): string;
}
```

### Client Factory
Use the factory function to get all clients:

```typescript
import { getAllClients } from './clients';

const clients = getAllClients();
const buildInfo = await clients.BuildClient.getBuildInfo();
```

### Individual Client Usage
Import and use specific clients:

```typescript
import { BuildClient, GitClient } from './clients';

const buildInfo = await BuildClient.getBuildInfo();
const commitInfo = await GitClient.getCommitInfo();
```

## 🧪 Testing

Each client should have corresponding tests:

```
tests/
└── clients/
    ├── base.test.ts
    ├── build.test.ts
    ├── git.test.ts
    ├── pipeline.test.ts
    └── notification.test.ts
```

## 📝 Adding New Clients

1. **Create new client file** in appropriate category
2. **Extend BaseAzureDevOpsClient**:
   ```typescript
   export class MyNewClient extends BaseAzureDevOpsClient {
       static async myMethod(): Promise<any> {
           return this.makeRequest('/my/endpoint');
       }
   }
   ```
3. **Export from index.ts**
4. **Add to getAllClients() factory**
5. **Write tests**
6. **Update documentation**

## 🔄 Best Practices for Modern Client Usage

All tools and external code should use the specialized clients:

```typescript
// ✅ Recommended approach
import { BuildClient, GitClient } from './clients';

const buildInfo = await BuildClient.getBuildInfo();
const commitInfo = await GitClient.getCommitInfo();
```

### Individual Client Usage
Import and use specific clients based on your needs:

```typescript
import { BuildClient } from './clients/build';
import { GitClient } from './clients/git';
import { PipelineClient } from './clients/pipeline';
import { NotificationClient } from './clients/notification';

// Use typed methods for specific operations
const buildInfo = await BuildClient.getBuildInfo();
const timeline = await PipelineClient.getPipelineTimeline();
const notification = await NotificationClient.sendTeamsNotification(webhookUrl, message);
```

## 🎯 Best Practices

- **Single Responsibility**: Each client handles one domain
- **Type Safety**: Use TypeScript interfaces for request/response types
- **Error Handling**: Consistent error handling across all clients
- **Documentation**: JSDoc comments for all public methods
- **Testing**: Unit tests for each client method
- **Backwards Compatibility**: Maintain legacy exports during transition

## 🔧 Maintenance

- Keep clients focused and small
- Update documentation when adding features
- Use consistent naming conventions
- Follow the established patterns from BaseAzureDevOpsClient
- Write comprehensive tests for new functionality
