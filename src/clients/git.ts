import { BaseAzureDevOpsClient } from './base';

/**
 * Client for Azure DevOps Git API operations
 */
export class GitClient extends BaseAzureDevOpsClient {
    /**
     * Get commit information
     * @param repositoryId - Repository ID (optional, uses current repository if not provided)
     * @param commitId - Commit ID (optional, uses current source version if not provided)
     */
    static async getCommitInfo(repositoryId?: string, commitId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        const commit = commitId || this.getSourceVersion();
        return this.makeRequest(`/git/repositories/${repoId}/commits/${commit}?api-version=7.0`);
    }

    /**
     * Get changes for a specific commit
     * @param repositoryId - Repository ID or name (optional, uses current repository if not provided)
     * @param commitId - Commit ID
     */
    static async getCommitChanges(repositoryId?: string, commitId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        const commit = commitId || this.getSourceVersion();

        // Try with repository ID first, then fall back to repository name if needed
        try {
            return await this.makeRequest(
                `/git/repositories/${repoId}/commits/${commit}/changes?api-version=7.0`
            );
        } catch (error) {
            if (!repositoryId) {
                // If we used the internal repository ID and it failed, try with repository name as fallback
                console.log(
                    `Failed with repository ID ${repoId}, trying with repository name as fallback`
                );
                const repoName = this.getRepositoryName();
                return await this.makeRequest(
                    `/git/repositories/${repoName}/commits/${commit}/changes?api-version=7.0`
                );
            } else {
                // If a specific repository ID was provided, don't try fallback
                throw error;
            }
        }
    }

    /**
     * Get pull request information
     * @param repositoryId - Repository ID (optional, uses current repository if not provided)
     * @param pullRequestId - Pull request ID
     */
    static async getPullRequest(pullRequestId: string, repositoryId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        return this.makeRequest(
            `/git/repositories/${repoId}/pullrequests/${pullRequestId}?api-version=7.0`
        );
    }

    /**
     * Get repository information
     * @param repositoryId - Repository ID (optional, uses current repository if not provided)
     */
    static async getRepository(repositoryId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        return this.makeRequest(`/git/repositories/${repoId}`);
    }

    /**
     * Get branch policies for a repository
     * @param repositoryId - Repository ID (optional, uses current repository if not provided)
     */
    static async getBranchPolicies(repositoryId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        return this.makeRequest(`/policy/configurations?repositoryId=${repoId}`);
    }

    /**
     * Get branches for a repository
     * @param repositoryId - Repository ID (optional, uses current repository if not provided)
     */
    static async getBranches(repositoryId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        return this.makeRequest(`/git/repositories/${repoId}/refs?filter=heads/&api-version=7.0`);
    }

    /**
     * Get tags for a repository
     * @param repositoryId - Repository ID (optional, uses current repository if not provided)
     */
    static async getTags(repositoryId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        return this.makeRequest(`/git/repositories/${repoId}/refs?filter=tags/&api-version=7.0`);
    }
}
