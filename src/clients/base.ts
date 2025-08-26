import * as tl from 'azure-pipelines-task-lib/task';

/**
 * Base client for Azure DevOps API interactions
 * Provides common authentication and request handling
 */
export abstract class BaseAzureDevOpsClient {
    /**
     * Get the authorization header for Azure DevOps API requests
     */
    protected static getAuthHeader(): string {
        const accessToken = tl.getVariable('System.AccessToken');
        if (!accessToken) {
            throw new Error(
                'System.AccessToken not available. Ensure the task has access to the OAuth token.'
            );
        }
        return `Bearer ${accessToken}`;
    }

    /**
     * Get the base URL for Azure DevOps APIs
     */
    protected static getBaseUrl(): string {
        const collectionUri = tl.getVariable('System.CollectionUri');
        const teamProject = tl.getVariable('System.TeamProject');
        if (!collectionUri || !teamProject) {
            throw new Error('Required Azure DevOps variables not available');
        }
        return `${collectionUri}${teamProject}/_apis`;
    }

    /**
     * Make a generic request to Azure DevOps API
     * @param endpoint - API endpoint (starting with /)
     * @param method - HTTP method (default: GET)
     * @param body - Request body for POST/PUT requests
     */
    protected static async makeRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any
    ): Promise<any> {
        const baseUrl = this.getBaseUrl();
        const url = `${baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
        };

        const requestInit: RequestInit = {
            method,
            headers,
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            requestInit.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestInit);

        if (!response.ok) {
            throw new Error(
                `Azure DevOps API request failed: ${response.status} ${response.statusText} - ${endpoint}`
            );
        }

        return await response.json();
    }

    /**
     * Get current build ID from pipeline variables
     */
    protected static getBuildId(): string {
        const buildId = tl.getVariable('Build.BuildId');
        if (!buildId) {
            throw new Error('Build.BuildId not available');
        }
        return buildId;
    }

    /**
     * Get current repository ID from pipeline variables
     */
    protected static getRepositoryId(): string {
        const repositoryId = tl.getVariable('Build.Repository.ID');
        if (!repositoryId) {
            throw new Error('Build.Repository.ID not available');
        }
        return repositoryId;
    }

    /**
     * Get current source version (commit SHA) from pipeline variables
     */
    protected static getSourceVersion(): string {
        const sourceVersion = tl.getVariable('Build.SourceVersion');
        if (!sourceVersion) {
            throw new Error('Build.SourceVersion not available');
        }
        return sourceVersion;
    }
}
