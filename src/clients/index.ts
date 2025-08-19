// Export base client
export { BaseAzureDevOpsClient } from './base';

// Export specialized clients
export { BuildClient } from './build';
export { GitClient } from './git';
export { PipelineClient } from './pipeline';
export { NotificationClient } from './notification';

// Import for internal use
import { BaseAzureDevOpsClient } from './base';
import { BuildClient } from './build';
import { GitClient } from './git';
import { PipelineClient } from './pipeline';
import { NotificationClient } from './notification';

/**
 * Factory function to get all available clients
 * @returns Object containing all client classes
 */
export function getAllClients() {
    return {
        BaseAzureDevOpsClient,
        BuildClient,
        GitClient,
        PipelineClient,
        NotificationClient,
    };
}

/**
 * Client categories for better organization
 */
export const ClientCategories = {
    BUILD: 'Build & Testing',
    GIT: 'Git & Source Control',
    PIPELINE: 'Pipeline & Execution',
    NOTIFICATION: 'Notifications & Alerts',
} as const;
