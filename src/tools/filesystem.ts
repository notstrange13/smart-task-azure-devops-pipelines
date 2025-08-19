import { Tool } from './base';
import { ToolResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tool for reading file contents
 */
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
 * Tool for listing directory contents
 */
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
                    error: `Directory does not exist: ${fullPath}`,
                };
            }

            if (!fs.statSync(fullPath).isDirectory()) {
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

            return {
                name: this.name,
                result: fileDetails,
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
