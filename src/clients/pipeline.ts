import { BaseAzureDevOpsClient } from './base';

/**
 * Client for Azure DevOps Pipeline API operations
 */
export class PipelineClient extends BaseAzureDevOpsClient {
    /**
     * Get pipeline timeline (execution stages and performance metrics)
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getPipelineTimeline(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        return this.makeRequest(`/build/builds/${id}/timeline`);
    }

    /**
     * Get pipeline definition
     * @param definitionId - Pipeline definition ID
     */
    static async getPipelineDefinition(definitionId: string): Promise<any> {
        return this.makeRequest(`/build/definitions/${definitionId}?api-version=7.0`);
    }

    /**
     * Get pipeline runs for a definition
     * @param definitionId - Pipeline definition ID
     * @param top - Number of runs to retrieve (default: 10)
     */
    static async getPipelineRuns(definitionId: string, top: number = 10): Promise<any> {
        return this.makeRequest(`/build/builds?definitions=${definitionId}&$top=${top}&api-version=7.0`);
    }

    /**
     * Get pipeline variables for current build
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getPipelineVariables(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        const buildInfo = await this.makeRequest(`/build/builds/${id}?api-version=7.0`);
        return buildInfo.parameters || {};
    }

    /**
     * Get pipeline logs
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getPipelineLogs(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        return this.makeRequest(`/build/builds/${id}/logs?api-version=7.0`);
    }

    /**
     * Get pipeline log content for a specific log
     * @param buildId - Build ID
     * @param logId - Log ID
     */
    static async getLogContent(buildId: string, logId: string): Promise<string> {
        const response = await fetch(`${this.getBaseUrl()}/build/builds/${buildId}/logs/${logId}?api-version=7.0`, {
            headers: {
                'Authorization': this.getAuthHeader()
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get log content: ${response.status} ${response.statusText}`);
        }

        return await response.text();
    }
}
