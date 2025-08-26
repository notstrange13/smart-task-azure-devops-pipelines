import { Tool } from './base';
import { ToolResult } from '../types';

/**
 * Tool for getting environment variable values
 */
export class GetEnvironmentVariableTool extends Tool {
    name = 'get_environment_variable';
    description = 'Get the value of an environment variable';

    async execute(variableName: string): Promise<ToolResult> {
        try {
            console.log(`Getting environment variable: ${variableName}`);
            const value = process.env[variableName];
            
            if (value) {
                console.log(`Environment variable found: ${variableName} = ${value.length > 100 ? value.substring(0, 100) + '...' : value}`);
            } else {
                console.log(`Environment variable not found: ${variableName}`);
            }
            
            return {
                name: this.name,
                result: value || null,
                success: true,
            };
        } catch (error) {
            console.log(`Failed to get environment variable: ${variableName} - ${error instanceof Error ? error.message : String(error)}`);
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
 * Tool for executing shell commands
 */
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

            return new Promise<ToolResult>(resolve => {
                const shell = isWindows ? 'cmd' : 'sh';
                const shellFlag = isWindows ? '/c' : '-c';

                const child = spawn(shell, [shellFlag, command], {
                    stdio: 'pipe',
                    cwd: process.cwd(),
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
                        executionTime: new Date().toISOString(),
                    };

                    resolve({
                        name: this.name,
                        result,
                        success: code === 0,
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
                            executionTime: new Date().toISOString(),
                        },
                        success: false,
                        error: error.message,
                    });
                });
            });
        } catch (error) {
            console.log(
                `Failed to start command execution: ${error instanceof Error ? error.message : String(error)}`
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
