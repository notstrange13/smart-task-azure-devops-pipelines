import { Tool } from './base';
import { ToolResult } from '../types';
import { BuildClient } from '../clients/build';
import { GitClient } from '../clients/git';
import * as tl from 'azure-pipelines-task-lib/task';

/**
 * Tool for getting changed files in the current build
 */
export class GetBuildChangesTool extends Tool {
    name = 'get_build_changes';
    description = 'Get the list of files changed in the current build';

    async execute(input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');
            const sourceVersion = tl.getVariable('Build.SourceVersion');
            const sourceBranch = tl.getVariable('Build.SourceBranch');
            
            if (!buildId) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Build.BuildId not available'
                };
            }

            // Get the changes for this build
            const changesResponse = await BuildClient.getBuildChanges(buildId);
            
            let changedFiles: string[] = [];
            
            // If we have changes, get the detailed file changes
            if (changesResponse.value && changesResponse.value.length > 0) {
                for (const change of changesResponse.value) {
                    try {
                        const commitChanges = await GitClient.getCommitChanges(change.location, change.id);
                        if (commitChanges.changes) {
                            const files = commitChanges.changes.map((c: any) => c.item?.path || c.path).filter(Boolean);
                            changedFiles.push(...files);
                        }
                    } catch (error) {
                        console.warn(`Failed to get changes for commit ${change.id}:`, error);
                    }
                }
            }

            // Remove duplicates
            changedFiles = [...new Set(changedFiles)];

            return {
                name: this.name,
                result: {
                    buildId,
                    sourceVersion,
                    sourceBranch,
                    changedFiles,
                    totalChangedFiles: changedFiles.length
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
 * Tool for getting build information
 */
export class GetBuildInfoTool extends Tool {
    name = 'get_build_info';
    description = 'Get detailed information about the current build';

    async execute(input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');
            
            if (!buildId) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Build.BuildId not available'
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
                    sourceVersion: buildInfo.sourceVersion
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
 * Tool for getting test results
 */
export class GetTestResultsTool extends Tool {
    name = 'get_test_results';
    description = 'Get test results for the current build';

    async execute(input: string): Promise<ToolResult> {
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
                    testRuns: testResults.value || []
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
                    allArtifacts: artifacts.value?.map((a: any) => a.name) || []
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
 * Tool for getting work items associated with a build
 */
export class GetBuildWorkItemsTool extends Tool {
    name = 'get_build_work_items';
    description = 'Get work items associated with the current build';

    async execute(input: string): Promise<ToolResult> {
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
                    workItems: workItems.value || []
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
