import { Tool } from './base';
import { ToolResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';

/**
 * Tool for reading file contents
 */
export class ReadFileTool extends Tool {
    name = 'read_file';
    description = 'Read the contents of a file';

    async execute(filePath: string): Promise<ToolResult> {
        try {
            // Get the source directory (where the code is checked out)
            // This is the working directory for the pipeline, not the task directory
            const sourceDirectory = tl.getVariable('Build.SourcesDirectory') || tl.getVariable('System.DefaultWorkingDirectory') || process.cwd();
            
            let fullPath: string;
            if (path.isAbsolute(filePath)) {
                fullPath = filePath;
            } else {
                // Resolve relative paths against the source directory, not the task directory
                fullPath = path.resolve(sourceDirectory, filePath);
            }
            
            console.log(`Reading file: ${fullPath}`);
            console.log(`Source directory: ${sourceDirectory}`);
            
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            const size = Buffer.byteLength(content, 'utf8');
            
            console.log(`File read successfully: ${lines} lines, ${size} bytes`);
            
            return {
                name: this.name,
                result: content,
                success: true,
            };
        } catch (error) {
            console.log(`Failed to read file: ${filePath} - ${error instanceof Error ? error.message : String(error)}`);
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
 * Tool for writing content to files
 */
export class WriteFileTool extends Tool {
    name = 'write_file';
    description = 'Write content to a file';

    async execute(input: string): Promise<ToolResult> {
        try {
            const { filePath, content } = JSON.parse(input);
            if (!filePath || content === undefined) {
                throw new Error('filePath and content are required');
            }

            // Get the source directory (where the code is checked out)
            const sourceDirectory = tl.getVariable('Build.SourcesDirectory') || tl.getVariable('System.DefaultWorkingDirectory') || process.cwd();
            
            let fullPath: string;
            if (path.isAbsolute(filePath)) {
                fullPath = filePath;
            } else {
                // Resolve relative paths against the source directory, not the task directory
                fullPath = path.resolve(sourceDirectory, filePath);
            }
            
            const dirPath = path.dirname(fullPath);
            
            console.log(`Writing file: ${fullPath}`);
            console.log(`Source directory: ${sourceDirectory}`);

            // Create directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`Created directory: ${dirPath}`);
            }

            fs.writeFileSync(fullPath, content, 'utf8');
            
            const size = Buffer.byteLength(content, 'utf8');
            const lines = content.split('\n').length;
            console.log(`File written successfully: ${lines} lines, ${size} bytes`);

            return {
                name: this.name,
                result: { filePath: fullPath, size: content.length },
                success: true,
            };
        } catch (error) {
            console.log(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
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
 * Tool for listing directory contents
 */
export class ListDirectoryTool extends Tool {
    name = 'list_directory';
    description = 'List the contents of a directory';

    async execute(dirPath: string): Promise<ToolResult> {
        try {
            // Get the source directory (where the code is checked out)
            const sourceDirectory = tl.getVariable('Build.SourcesDirectory') || tl.getVariable('System.DefaultWorkingDirectory') || process.cwd();
            
            let fullPath: string;
            if (path.isAbsolute(dirPath)) {
                fullPath = dirPath;
            } else {
                // Resolve relative paths against the source directory, not the task directory
                fullPath = path.resolve(sourceDirectory, dirPath);
            }
            
            console.log(`Listing directory: ${fullPath}`);
            console.log(`Source directory: ${sourceDirectory}`);

            if (!fs.existsSync(fullPath)) {
                console.log(`Directory does not exist: ${fullPath}`);
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: `Directory does not exist: ${fullPath}`,
                };
            }

            if (!fs.statSync(fullPath).isDirectory()) {
                console.log(`Path is not a directory: ${fullPath}`);
                return {
                    name: this.name,
                    result: null,
                    success: false,
                    error: `Path is not a directory: ${fullPath}`,
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
                    modified: stats.mtime,
                };
            });

            console.log(`Directory listing completed: ${fileDetails.length} items found`);
            console.log(`Files: ${fileDetails.filter(f => f.type === 'file').length}, Directories: ${fileDetails.filter(f => f.type === 'directory').length}`);

            return {
                name: this.name,
                result: fileDetails,
                success: true,
            };
        } catch (error) {
            console.log(`Failed to list directory: ${dirPath} - ${error instanceof Error ? error.message : String(error)}`);
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
