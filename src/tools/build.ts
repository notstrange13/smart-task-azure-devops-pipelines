import { Tool } from './base';
import { ToolResult } from '../types';
import { BuildClient } from '../clients/build';
import { GitClient } from '../clients/git';
import * as tl from 'azure-pipelines-task-lib/task';

/**
 * Tool for getting Azure DevOps build context information
 */
export class GetBuildContextTool extends Tool {
    name = 'get_build_context';
    description =
        'Get comprehensive Azure DevOps build context including source branch, target branch, build reason, repository info, and more. This provides all build-related information in one call.';

    async execute(): Promise<ToolResult> {
        try {
            console.log('Getting Azure DevOps build context...');

            const buildContext = {
                // Branch information
                sourceBranch: tl.getVariable('Build.SourceBranch') || null,
                sourceBranchName: tl.getVariable('Build.SourceBranchName') || null,
                targetBranch: tl.getVariable('System.PullRequest.TargetBranch') || null,
                targetBranchName: tl.getVariable('System.PullRequest.TargetBranchName') || null,

                // Build information
                buildReason: tl.getVariable('Build.Reason') || null,
                buildId: tl.getVariable('Build.BuildId') || null,
                buildNumber: tl.getVariable('Build.BuildNumber') || null,
                buildDefinitionName: tl.getVariable('Build.DefinitionName') || null,

                // Repository information
                repositoryName: tl.getVariable('Build.Repository.Name') || null,
                repositoryProvider: tl.getVariable('Build.Repository.Provider') || null,
                repositoryUri: tl.getVariable('Build.Repository.Uri') || null,

                // Pull request information (if applicable)
                isPullRequest: tl.getVariable('Build.Reason') === 'PullRequest',
                pullRequestId: tl.getVariable('System.PullRequest.PullRequestId') || null,
                pullRequestSourceBranch: tl.getVariable('System.PullRequest.SourceBranch') || null,

                // Agent information
                agentName: tl.getVariable('Agent.Name') || null,
                agentOS: tl.getVariable('Agent.OS') || null,

                // System information
                teamProject: tl.getVariable('System.TeamProject') || null,
                collectionUri: tl.getVariable('System.CollectionUri') || null,
            };

            console.log('Build context retrieved successfully:');
            console.log(`- Source Branch: ${buildContext.sourceBranchName}`);
            console.log(`- Build Reason: ${buildContext.buildReason}`);
            console.log(`- Is Pull Request: ${buildContext.isPullRequest}`);
            console.log(`- Repository: ${buildContext.repositoryName}`);

            return {
                name: this.name,
                result: buildContext,
                success: true,
            };
        } catch (error) {
            console.log(
                `Failed to get build context: ${error instanceof Error ? error.message : String(error)}`
            );
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

/**
 * Tool for getting changed files in the current build
 */
export class GetBuildChangesTool extends Tool {
    name = 'get_build_changes';
    description = 'Get the list of files changed in the current build';

    async execute(_input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');
            const sourceVersion = tl.getVariable('Build.SourceVersion');
            const sourceBranch = tl.getVariable('Build.SourceBranch');

            console.log(`Getting build changes for Build ID: ${buildId}`);

            if (!buildId) {
                console.log('Build.BuildId not available');
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Build.BuildId not available',
                };
            }

            // Get the changes for this build
            const changesResponse = await BuildClient.getBuildChanges(buildId);

            let changedFiles: string[] = [];

            console.log(`Found ${changesResponse.value?.length || 0} commits with changes`);

            // If we have changes, get the detailed file changes
            if (changesResponse.value && changesResponse.value.length > 0) {
                const repositoryId = tl.getVariable('Build.Repository.ID');
                if (!repositoryId) {
                    console.log('Build.Repository.ID not available, cannot get detailed changes');
                } else {
                    for (const change of changesResponse.value) {
                        try {
                            console.log(`Getting changes for commit: ${change.id}`);
                            const commitChanges = await GitClient.getCommitChanges(
                                repositoryId,
                                change.id
                            );
                            if (commitChanges.changes) {
                                const files = commitChanges.changes
                                    .map((c: any) => c.item?.path || c.path)
                                    .filter(Boolean);
                                changedFiles.push(...files);
                                console.log(
                                    `Found ${files.length} changed files in commit ${change.id}`
                                );
                            }
                        } catch (error) {
                            console.warn(`Failed to get changes for commit ${change.id}:`, error);
                        }
                    }
                }
            } // Remove duplicates
            changedFiles = [...new Set(changedFiles)];

            console.log(
                `Build changes analysis completed: ${changedFiles.length} unique files changed`
            );
            if (changedFiles.length > 0) {
                console.log(
                    `Sample changed files: ${changedFiles.slice(0, 5).join(', ')}${changedFiles.length > 5 ? '...' : ''}`
                );
            }

            return {
                name: this.name,
                result: {
                    buildId,
                    sourceVersion,
                    sourceBranch,
                    changedFiles,
                    totalChangedFiles: changedFiles.length,
                },
                success: true,
            };
        } catch (error) {
            console.log(
                `Failed to get build changes: ${error instanceof Error ? error.message : String(error)}`
            );
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

/**
 * Tool for getting build information
 */
export class GetBuildInfoTool extends Tool {
    name = 'get_build_info';
    description = 'Get detailed information about the current build';

    async execute(_input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');

            if (!buildId) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Build.BuildId not available',
                };
            }

            const buildInfo = await BuildClient.getBuildInfo(buildId);

            return {
                name: this.name,
                result: {
                    buildId: buildInfo.id,
                    buildNumber: buildInfo.buildNumber,
                    status: buildInfo.status,
                    result: buildInfo.result,
                    queueTime: buildInfo.queueTime,
                    startTime: buildInfo.startTime,
                    finishTime: buildInfo.finishTime,
                    reason: buildInfo.reason,
                    requestedFor: buildInfo.requestedFor,
                    definition: buildInfo.definition,
                    repository: buildInfo.repository,
                    sourceBranch: buildInfo.sourceBranch,
                    sourceVersion: buildInfo.sourceVersion,
                },
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

/**
 * Tool for getting test results
 */
export class GetTestResultsTool extends Tool {
    name = 'get_test_results';
    description = 'Get test results for the current build';

    async execute(_input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');

            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const testResults = await BuildClient.getTestResults(buildId);

            return {
                name: this.name,
                result: {
                    totalTests: testResults.count || 0,
                    passedTests: testResults.passedTests || 0,
                    failedTests: testResults.failedTests || 0,
                    skippedTests: testResults.skippedTests || 0,
                    testRuns: testResults.value || [],
                },
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

/**
 * Tool for checking artifact existence
 */
export class CheckArtifactExistsTool extends Tool {
    name = 'check_artifact_exists';
    description = 'Check if a specific artifact exists in the current build';

    async execute(artifactName: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');

            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const artifacts = await BuildClient.getArtifacts(buildId);
            const artifact = artifacts.value?.find((a: any) => a.name === artifactName);

            return {
                name: this.name,
                result: {
                    exists: !!artifact,
                    artifact: artifact || null,
                    allArtifacts: artifacts.value?.map((a: any) => a.name) || [],
                },
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

/**
 * Tool for getting work items associated with a build
 */
export class GetBuildWorkItemsTool extends Tool {
    name = 'get_build_work_items';
    description = 'Get work items associated with the current build';

    async execute(_input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');

            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const workItems = await BuildClient.getBuildWorkItems(buildId);

            return {
                name: this.name,
                result: {
                    count: workItems.count || 0,
                    workItems: workItems.value || [],
                },
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
