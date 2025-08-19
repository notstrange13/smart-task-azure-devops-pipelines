import { ToolResult } from './types';
import { AzureDevOpsClient } from './clients';
import * as fs from 'fs';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';

export abstract class Tool {
    abstract name: string;
    abstract description: string;
    abstract execute(input: string): Promise<ToolResult>;
}

export class GetPipelineVariableTool extends Tool {
    name = 'get_pipeline_variable';
    description = 'Get the value of a pipeline variable by name';

    async execute(variableName: string): Promise<ToolResult> {
        try {
            const value = tl.getVariable(variableName);
            return {
                name: this.name,
                result: value || null,
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

export class ReadFileTool extends Tool {
    name = 'read_file';
    description = 'Read the contents of a file';

    async execute(filePath: string): Promise<ToolResult> {
        try {
            const fullPath = path.resolve(filePath);
            const content = fs.readFileSync(fullPath, 'utf8');
            return {
                name: this.name,
                result: content,
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

export class GetEnvironmentVariableTool extends Tool {
    name = 'get_environment_variable';
    description = 'Get the value of an environment variable';

    async execute(variableName: string): Promise<ToolResult> {
        try {
            const value = process.env[variableName];
            return {
                name: this.name,
                result: value || null,
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

export class ListDirectoryTool extends Tool {
    name = 'list_directory';
    description = 'List the contents of a directory';

    async execute(dirPath: string): Promise<ToolResult> {
        try {
            const fullPath = path.resolve(dirPath);
            
            if (!fs.existsSync(fullPath)) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: `Directory does not exist: ${fullPath}`
                };
            }

            if (!fs.statSync(fullPath).isDirectory()) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: `Path is not a directory: ${fullPath}`
                };
            }

            const files = fs.readdirSync(fullPath);
            const fileDetails = files.map(file => {
                const filePath = path.join(fullPath, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    modified: stats.mtime
                };
            });

            return {
                name: this.name,
                result: fileDetails,
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

export class ExecuteCommandTool extends Tool {
    name = 'execute_command';
    description = 'Execute a shell command';

    async execute(command: string): Promise<ToolResult> {
        try {
            const { spawn } = require('child_process');
            const isWindows = process.platform === 'win32';
            
            console.log(`Executing command: ${command}`);
            console.log(`Working directory: ${process.cwd()}`);
            console.log(`Platform: ${process.platform}`);
            console.log('Command output:');
            console.log('────────────────────────────────────────');
            
            return new Promise<ToolResult>((resolve) => {
                const shell = isWindows ? 'cmd' : 'sh';
                const shellFlag = isWindows ? '/c' : '-c';
                
                const child = spawn(shell, [shellFlag, command], {
                    stdio: 'pipe',
                    cwd: process.cwd()
                });

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data: Buffer) => {
                    const output = data.toString();
                    stdout += output;
                    // Show real-time stdout
                    process.stdout.write(output);
                });

                child.stderr.on('data', (data: Buffer) => {
                    const output = data.toString();
                    stderr += output;
                    // Show real-time stderr in red
                    process.stderr.write(`\x1b[31m${output}\x1b[0m`);
                });

                child.on('close', (code: number) => {
                    console.log('────────────────────────────────────────');
                    console.log(`Command completed with exit code: ${code}`);
                    if (code === 0) {
                        console.log('Command executed successfully!');
                    } else {
                        console.log(`Command failed with exit code: ${code}`);
                    }
                    console.log('');

                    const result = {
                        command,
                        exitCode: code,
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        workingDirectory: process.cwd(),
                        platform: process.platform,
                        executionTime: new Date().toISOString()
                    };

                    resolve({
                        name: this.name,
                        result,
                        success: code === 0
                    });
                });

                child.on('error', (error: Error) => {
                    console.log('────────────────────────────────────────');
                    console.log(`Command execution failed: ${error.message}`);
                    console.log('');

                    resolve({
                        name: this.name,
                        result: {
                            command,
                            error: error.message,
                            workingDirectory: process.cwd(),
                            platform: process.platform,
                            executionTime: new Date().toISOString()
                        },
                        success: false,
                        error: error.message
                    });
                });
            });
        } catch (error) {
            console.log(`Failed to start command execution: ${error instanceof Error ? error.message : String(error)}`);
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

export class SetPipelineVariableTool extends Tool {
    name = 'set_pipeline_variable';
    description = 'Set a pipeline variable that can be used by subsequent tasks';

    async execute(input: string): Promise<ToolResult> {
        try {
            // Parse input - expecting JSON with name and value
            let parsedInput;
            
            // Handle case where input might already be an object
            if (typeof input === 'object' && input !== null) {
                parsedInput = input;
            } else if (typeof input === 'string') {
                try {
                    parsedInput = JSON.parse(input);
                } catch {
                    // If not JSON, treat as simple name=value format
                    const parts = input.split('=');
                    if (parts.length !== 2) {
                        return {
                            name: this.name,
                            result: null,
                            success: false,
                            error: 'Input must be JSON {"name": "varName", "value": "varValue"} or name=value format'
                        };
                    }
                    parsedInput = { name: parts[0].trim(), value: parts[1].trim() };
                }
            } else {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Input must be a string or object with name and value properties'
                };
            }

            const { name, value } = parsedInput;
            
            if (!name) {
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: 'Variable name is required'
                };
            }

            console.log(`Setting pipeline variable: ${name} = ${value}`);

            // Set as pipeline variable for subsequent tasks
            tl.setVariable(name, value);
            
            // Also set as output variable
            tl.setVariable(name, value, false, true);

            return {
                name: this.name,
                result: { name, value },
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

// Azure DevOps Context Tools
export class GetChangedFilesTool extends Tool {
    name = 'get_changed_files';
    description = 'Get the list of files changed in the current build/pull request';

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
            const changesResponse = await AzureDevOpsClient.makeRequest(`/build/builds/${buildId}/changes?api-version=7.0`);
            
            let changedFiles: string[] = [];
            
            // If we have changes, get the detailed file changes
            if (changesResponse.value && changesResponse.value.length > 0) {
                for (const change of changesResponse.value) {
                    try {
                        const commitChanges = await AzureDevOpsClient.makeRequest(`/git/repositories/${change.location}/commits/${change.id}/changes?api-version=7.0`);
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

            const commitInfo = await AzureDevOpsClient.makeRequest(`/git/repositories/${repositoryId}/commits/${sourceVersion}?api-version=7.0`);
            
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

            const prInfo = await AzureDevOpsClient.makeRequest(`/git/repositories/${repositoryId}/pullrequests/${prId}?api-version=7.0`);
            
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

            const buildInfo = await AzureDevOpsClient.makeRequest(`/build/builds/${buildId}?api-version=7.0`);
            
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

export class WriteFileTool extends Tool {
    name = 'write_file';
    description = 'Write content to a file';

    async execute(input: string): Promise<ToolResult> {
        try {
            const { filePath, content } = JSON.parse(input);
            if (!filePath || content === undefined) {
                throw new Error('filePath and content are required');
            }

            const fullPath = path.resolve(filePath);
            const dirPath = path.dirname(fullPath);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, content, 'utf8');
            
            return {
                name: this.name,
                result: { filePath: fullPath, size: content.length },
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

export class GetTestResultsTool extends Tool {
    name = 'get_test_results';
    description = 'Get test results for the current build';

    async execute(input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');
            
            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const testResults = await AzureDevOpsClient.makeRequest(`/build/builds/${buildId}/testresults`);
            
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

export class GetPipelineTimelineTool extends Tool {
    name = 'get_pipeline_timeline';
    description = 'Get pipeline execution timeline and performance metrics';

    async execute(input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');
            
            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const timeline = await AzureDevOpsClient.makeRequest(`/build/builds/${buildId}/timeline`);
            
            return {
                name: this.name,
                result: {
                    records: timeline.records || [],
                    lastChangedBy: timeline.lastChangedBy,
                    lastChangedOn: timeline.lastChangedOn
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

export class GetWorkItemsTool extends Tool {
    name = 'get_work_items';
    description = 'Get work items associated with the current build or commit';

    async execute(input: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');
            
            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const workItems = await AzureDevOpsClient.makeRequest(`/build/builds/${buildId}/workitems`);
            
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

export class CheckArtifactExistsTool extends Tool {
    name = 'check_artifact_exists';
    description = 'Check if a specific artifact exists in the current build';

    async execute(artifactName: string): Promise<ToolResult> {
        try {
            const buildId = tl.getVariable('Build.BuildId');
            
            if (!buildId) {
                throw new Error('Build ID not available');
            }

            const artifacts = await AzureDevOpsClient.makeRequest(`/build/builds/${buildId}/artifacts`);
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

export class GetRepositoryInfoTool extends Tool {
    name = 'get_repository_info';
    description = 'Get repository information and statistics';

    async execute(input: string): Promise<ToolResult> {
        try {
            const repositoryId = tl.getVariable('Build.Repository.ID');
            
            if (!repositoryId) {
                throw new Error('Repository ID not available');
            }

            const repository = await AzureDevOpsClient.makeRequest(`/git/repositories/${repositoryId}`);
            
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

            const policies = await AzureDevOpsClient.makeRequest(`/policy/configurations?repositoryId=${repositoryId}`);
            
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

export class SendNotificationTool extends Tool {
    name = 'send_notification';
    description = 'Send notification to teams via Azure DevOps (creates a work item or sends to service hooks)';

    async execute(input: string): Promise<ToolResult> {
        try {
            const { message, severity = 'info', recipients } = JSON.parse(input);
            
            if (!message) {
                throw new Error('message is required');
            }

            // For now, we'll log the notification
            // In a real implementation, this could integrate with Teams, Slack, email, etc.
            const notification = {
                message,
                severity,
                recipients: recipients || 'build-team',
                timestamp: new Date().toISOString(),
                buildId: tl.getVariable('Build.BuildId'),
                buildNumber: tl.getVariable('Build.BuildNumber'),
                project: tl.getVariable('System.TeamProject')
            };

            console.log(`NOTIFICATION [${severity.toUpperCase()}]: ${message}`);
            console.log(`Recipients: ${notification.recipients}`);
            console.log(`Build: ${notification.buildNumber} (${notification.buildId})`);
            
            return {
                name: this.name,
                result: notification,
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
