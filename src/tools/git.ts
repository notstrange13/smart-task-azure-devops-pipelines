import { Tool } from './base';
import { ToolResult } from '../types';
import { GitClient } from '../clients/git';
import * as tl from 'azure-pipelines-task-lib/task';

/**
 * Tool for getting commit information
 */
export class GetCommitInfoTool extends Tool {
    name = 'get_commit_info';
    description = 'Get detailed information about the current commit';

    async execute(commitId?: string): Promise<ToolResult> {
        try {
            const sourceVersion = commitId || tl.getVariable('Build.SourceVersion');
            const repositoryId = tl.getVariable('Build.Repository.ID');
            
            if (!sourceVersion || !repositoryId) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Build.SourceVersion or Build.Repository.ID not available'
                };
            }

                        const commitInfo = await GitClient.getCommitInfo(repositoryId, sourceVersion);
            
            return {
                name: this.name,
                result: {
                    commitId: commitInfo.commitId,
                    author: commitInfo.author,
                    committer: commitInfo.committer,
                    comment: commitInfo.comment,
                    changeCounts: commitInfo.changeCounts,
                    url: commitInfo.url
                },
                success: true
            };

        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

/**
 * Tool for getting pull request information
 */
export class GetPullRequestInfoTool extends Tool {
    name = 'get_pull_request_info';
    description = 'Get pull request information if this build is triggered by a PR';

    async execute(input: string): Promise<ToolResult> {
        try {
            const prId = tl.getVariable('System.PullRequest.PullRequestId');
            const repositoryId = tl.getVariable('Build.Repository.ID');
            
            if (!prId) {
                return {
                    name: this.name,
                    result: {
                        isPullRequest: false,
                        message: 'This build is not triggered by a pull request'
                    },
                    success: true
                };
            }

                        const prInfo = await GitClient.getPullRequest(prId, repositoryId);
            
            return {
                name: this.name,
                result: {
                    isPullRequest: true,
                    pullRequestId: prInfo.pullRequestId,
                    title: prInfo.title,
                    description: prInfo.description,
                    status: prInfo.status,
                    createdBy: prInfo.createdBy,
                    sourceRefName: prInfo.sourceRefName,
                    targetRefName: prInfo.targetRefName,
                    mergeStatus: prInfo.mergeStatus
                },
                success: true
            };

        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

/**
 * Tool for getting repository information
 */
export class GetRepositoryInfoTool extends Tool {
    name = 'get_repository_info';
    description = 'Get repository information and statistics';

    async execute(input: string): Promise<ToolResult> {
        try {
            const repositoryId = tl.getVariable('Build.Repository.ID');
            
            if (!repositoryId) {
                throw new Error('Repository ID not available');
            }

                        const repository = await GitClient.getRepository(repositoryId);
            
            return {
                name: this.name,
                result: {
                    id: repository.id,
                    name: repository.name,
                    url: repository.url,
                    defaultBranch: repository.defaultBranch,
                    size: repository.size,
                    project: repository.project
                },
                success: true
            };

        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

/**
 * Tool for getting branch policies
 */
export class GetBranchPolicyTool extends Tool {
    name = 'get_branch_policy';
    description = 'Get branch policies for the current branch';

    async execute(input: string): Promise<ToolResult> {
        try {
            const repositoryId = tl.getVariable('Build.Repository.ID');
            const sourceBranch = tl.getVariable('Build.SourceBranch');
            
            if (!repositoryId || !sourceBranch) {
                throw new Error('Repository ID or source branch not available');
            }

                        const policies = await GitClient.getBranchPolicies(repositoryId);
            
            return {
                name: this.name,
                result: {
                    policies: policies.value || [],
                    count: policies.count || 0,
                    branch: sourceBranch
                },
                success: true
            };

        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
