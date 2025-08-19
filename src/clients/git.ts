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
     * @param repositoryId - Repository ID
     * @param commitId - Commit ID
     */
    static async getCommitChanges(repositoryId: string, commitId: string): Promise<any> {
        return this.makeRequest(`/git/repositories/${repositoryId}/commits/${commitId}/changes?api-version=7.0`);
    }

    /**
     * Get pull request information
     * @param repositoryId - Repository ID (optional, uses current repository if not provided)
     * @param pullRequestId - Pull request ID
     */
    static async getPullRequest(pullRequestId: string, repositoryId?: string): Promise<any> {
        const repoId = repositoryId || this.getRepositoryId();
        return this.makeRequest(`/git/repositories/${repoId}/pullrequests/${pullRequestId}?api-version=7.0`);
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
