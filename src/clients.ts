import * as tl from 'azure-pipelines-task-lib/task';

export class AzureDevOpsClient {
    private static getAuthHeader(): string {
        const accessToken = tl.getVariable('System.AccessToken');
        if (!accessToken) {
            throw new Error('System.AccessToken not available. Ensure the task has access to the OAuth token.');
        }
        return `Bearer ${accessToken}`;
    }

    private static getBaseUrl(): string {
        const collectionUri = tl.getVariable('System.CollectionUri');
        const teamProject = tl.getVariable('System.TeamProject');
        if (!collectionUri || !teamProject) {
            throw new Error('Required Azure DevOps variables not available');
        }
        return `${collectionUri}${teamProject}/_apis`;
    }

    static async makeRequest(endpoint: string): Promise<any> {
        const baseUrl = this.getBaseUrl();
        const url = `${baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Azure DevOps API request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }
}
