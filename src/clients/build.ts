import { BaseAzureDevOpsClient } from './base';

/**
 * Client for Azure DevOps Build API operations
 */
export class BuildClient extends BaseAzureDevOpsClient {
    /**
     * Get detailed information about a build
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getBuildInfo(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        return this.makeRequest(`/build/builds/${id}?api-version=7.0`);
    }

    /**
     * Get test results for a build
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getTestResults(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        return this.makeRequest(`/build/builds/${id}/testresults`);
    }

    /**
     * Get artifacts for a build
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getArtifacts(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        return this.makeRequest(`/build/builds/${id}/artifacts`);
    }

    /**
     * Get changes associated with a build
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getBuildChanges(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        return this.makeRequest(`/build/builds/${id}/changes?api-version=7.0`);
    }

    /**
     * Get work items associated with a build
     * @param buildId - Build ID (optional, uses current build if not provided)
     */
    static async getBuildWorkItems(buildId?: string): Promise<any> {
        const id = buildId || this.getBuildId();
        return this.makeRequest(`/build/builds/${id}/workitems`);
    }
}
