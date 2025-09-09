import { InputProvider } from '../../../src/providers/input';
import { TaskMode } from '../../../src/types';
import * as tl from 'azure-pipelines-task-lib/task';

// Mock azure-pipelines-task-lib
jest.mock('azure-pipelines-task-lib/task', () => ({
    getInput: jest.fn(),
}));

describe('InputProvider', () => {
    let inputProvider: InputProvider;
    let originalEnv: NodeJS.ProcessEnv;
    const mockGetInput = tl.getInput as jest.MockedFunction<typeof tl.getInput>;

    beforeEach(() => {
        // Store original environment variables
        originalEnv = { ...process.env };
        // Clear all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore original environment variables
        process.env = originalEnv;
    });

    describe('constructor', () => {
        it('should set isDevMode to true when NODE_ENV is development', () => {
            // Arrange
            process.env.NODE_ENV = 'development';

            // Act
            inputProvider = new InputProvider();

            // Assert
            expect((inputProvider as any).isDevMode).toBe(true);
        });

        it('should set isDevMode to false when NODE_ENV is not development', () => {
            // Arrange
            process.env.NODE_ENV = 'production';

            // Act
            inputProvider = new InputProvider();

            // Assert
            expect((inputProvider as any).isDevMode).toBe(false);
        });

        it('should set isDevMode to false when NODE_ENV is not set', () => {
            // Arrange
            delete process.env.NODE_ENV;

            // Act
            inputProvider = new InputProvider();

            // Assert
            expect((inputProvider as any).isDevMode).toBe(false);
        });
    });

    describe('getTaskInputs - Development Mode', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
            inputProvider = new InputProvider();
        });

        it('should return valid task inputs in development mode', () => {
            // Arrange
            process.env.PROMPT = 'Test prompt for decision making';
            process.env.MODE = TaskMode.DECISION;
            process.env.ADDITIONAL_CONTEXT = '{"key": "value", "number": 42}';

            // Act
            const result = inputProvider.getTaskInputs();

            // Assert
            expect(result).toEqual({
                prompt: 'Test prompt for decision making',
                mode: TaskMode.DECISION,
                additionalContext: { key: 'value', number: 42 },
            });
        });

        it('should handle execution mode in development mode', () => {
            // Arrange
            process.env.PROMPT = 'Execute this task';
            process.env.MODE = TaskMode.EXECUTION;
            process.env.ADDITIONAL_CONTEXT = '{}';

            // Act
            const result = inputProvider.getTaskInputs();

            // Assert
            expect(result).toEqual({
                prompt: 'Execute this task',
                mode: TaskMode.EXECUTION,
                additionalContext: {},
            });
        });

        it('should use empty string when PROMPT is not set in development mode', () => {
            // Arrange
            delete process.env.PROMPT;
            process.env.MODE = TaskMode.DECISION;
            process.env.ADDITIONAL_CONTEXT = '{}';

            // Act & Assert
            expect(() => inputProvider.getTaskInputs()).toThrow(
                'Prompt is required but was not provided'
            );
        });

        it('should use default empty object when ADDITIONAL_CONTEXT is not set in development mode', () => {
            // Arrange
            process.env.PROMPT = 'Test prompt';
            process.env.MODE = TaskMode.DECISION;
            delete process.env.ADDITIONAL_CONTEXT;

            // Act
            const result = inputProvider.getTaskInputs();

            // Assert
            expect(result.additionalContext).toEqual({});
        });

        it('should handle invalid JSON in ADDITIONAL_CONTEXT in development mode', () => {
            // Arrange
            process.env.PROMPT = 'Test prompt';
            process.env.MODE = TaskMode.DECISION;
            process.env.ADDITIONAL_CONTEXT = 'invalid json {';

            // Act
            const result = inputProvider.getTaskInputs();

            // Assert
            expect(result.additionalContext).toEqual({});
        });
    });

    describe('getTaskInputs - Production Mode', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'production';
            inputProvider = new InputProvider();
        });

        it('should return valid task inputs in production mode using Azure DevOps task library', () => {
            // Arrange
            mockGetInput
                .mockReturnValueOnce('Test prompt from Azure DevOps')
                .mockReturnValueOnce(TaskMode.EXECUTION)
                .mockReturnValueOnce('{"azureDevOps": true}');

            // Act
            const result = inputProvider.getTaskInputs();

            // Assert
            expect(result).toEqual({
                prompt: 'Test prompt from Azure DevOps',
                mode: TaskMode.EXECUTION,
                additionalContext: { azureDevOps: true },
            });

            // Verify task library calls
            expect(mockGetInput).toHaveBeenCalledWith('prompt', true);
            expect(mockGetInput).toHaveBeenCalledWith('mode', true);
            expect(mockGetInput).toHaveBeenCalledWith('additionalContext', false);
        });

        it('should handle undefined values from Azure DevOps task library', () => {
            // Arrange
            mockGetInput
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(TaskMode.DECISION)
                .mockReturnValueOnce(undefined);

            // Act & Assert
            expect(() => inputProvider.getTaskInputs()).toThrow(
                'Prompt is required but was not provided'
            );
        });

        it('should use default empty object when additionalContext is undefined in production mode', () => {
            // Arrange
            mockGetInput
                .mockReturnValueOnce('Valid prompt')
                .mockReturnValueOnce(TaskMode.DECISION)
                .mockReturnValueOnce(undefined);

            // Act
            const result = inputProvider.getTaskInputs();

            // Assert
            expect(result.additionalContext).toEqual({});
        });

        it('should handle invalid JSON in additionalContext in production mode', () => {
            // Arrange
            mockGetInput
                .mockReturnValueOnce('Valid prompt')
                .mockReturnValueOnce(TaskMode.DECISION)
                .mockReturnValueOnce('invalid json {');

            // Act
            const result = inputProvider.getTaskInputs();

            // Assert
            expect(result.additionalContext).toEqual({});
        });
    });

    describe('validateInputs', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
            inputProvider = new InputProvider();
        });

        it('should not throw error with valid inputs', () => {
            // Act & Assert
            expect(() =>
                (inputProvider as any).validateInputs('Valid prompt', TaskMode.DECISION)
            ).not.toThrow();
        });

        it('should throw error when prompt is empty', () => {
            // Act & Assert
            expect(() => (inputProvider as any).validateInputs('', TaskMode.DECISION)).toThrow(
                'Prompt is required but was not provided'
            );
        });

        it('should throw error when prompt is null', () => {
            // Act & Assert
            expect(() => (inputProvider as any).validateInputs(null, TaskMode.DECISION)).toThrow(
                'Prompt is required but was not provided'
            );
        });

        it('should throw error when prompt is undefined', () => {
            // Act & Assert
            expect(() =>
                (inputProvider as any).validateInputs(undefined, TaskMode.DECISION)
            ).toThrow('Prompt is required but was not provided');
        });

        it('should throw error when mode is null', () => {
            // Act & Assert
            expect(() => (inputProvider as any).validateInputs('Valid prompt', null)).toThrow(
                'Mode is required and must be one of: decision, execution'
            );
        });

        it('should throw error when mode is undefined', () => {
            // Act & Assert
            expect(() => (inputProvider as any).validateInputs('Valid prompt', undefined)).toThrow(
                'Mode is required and must be one of: decision, execution'
            );
        });

        it('should throw error when mode is invalid string', () => {
            // Act & Assert
            expect(() =>
                (inputProvider as any).validateInputs('Valid prompt', 'invalid-mode' as TaskMode)
            ).toThrow('Mode is required and must be one of: decision, execution');
        });

        it('should accept DECISION mode', () => {
            // Act & Assert
            expect(() =>
                (inputProvider as any).validateInputs('Valid prompt', TaskMode.DECISION)
            ).not.toThrow();
        });

        it('should accept EXECUTION mode', () => {
            // Act & Assert
            expect(() =>
                (inputProvider as any).validateInputs('Valid prompt', TaskMode.EXECUTION)
            ).not.toThrow();
        });
    });

    describe('parseAdditionalContext', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
            inputProvider = new InputProvider();
        });

        it('should parse valid JSON string', () => {
            // Arrange
            const jsonString = '{"key": "value", "number": 42, "boolean": true}';

            // Act
            const result = (inputProvider as any).parseAdditionalContext(jsonString);

            // Assert
            expect(result).toEqual({
                key: 'value',
                number: 42,
                boolean: true,
            });
        });

        it('should return empty object for empty JSON string', () => {
            // Arrange
            const jsonString = '{}';

            // Act
            const result = (inputProvider as any).parseAdditionalContext(jsonString);

            // Assert
            expect(result).toEqual({});
        });

        it('should return empty object for invalid JSON string', () => {
            // Arrange
            const invalidJsonString = 'invalid json {';

            // Act
            const result = (inputProvider as any).parseAdditionalContext(invalidJsonString);

            // Assert
            expect(result).toEqual({});
        });

        it('should return empty object for malformed JSON', () => {
            // Arrange
            const malformedJsonString = '{"key": value}'; // missing quotes around value

            // Act
            const result = (inputProvider as any).parseAdditionalContext(malformedJsonString);

            // Assert
            expect(result).toEqual({});
        });

        it('should handle complex nested objects', () => {
            // Arrange
            const complexJsonString = JSON.stringify({
                user: { name: 'John', age: 30 },
                settings: { theme: 'dark', notifications: true },
                tags: ['tag1', 'tag2'],
            });

            // Act
            const result = (inputProvider as any).parseAdditionalContext(complexJsonString);

            // Assert
            expect(result).toEqual({
                user: { name: 'John', age: 30 },
                settings: { theme: 'dark', notifications: true },
                tags: ['tag1', 'tag2'],
            });
        });

        it('should return empty object for undefined input', () => {
            // Act
            const result = (inputProvider as any).parseAdditionalContext(undefined);

            // Assert
            expect(result).toEqual({});
        });
    });

    describe('getRawInputs - Development Mode', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
            inputProvider = new InputProvider();
        });

        it('should get inputs from environment variables in development mode', () => {
            // Arrange
            process.env.PROMPT = 'Dev prompt';
            process.env.MODE = TaskMode.EXECUTION;
            process.env.ADDITIONAL_CONTEXT = '{"dev": true}';

            // Act
            const result = (inputProvider as any).getRawInputs();

            // Assert
            expect(result).toEqual({
                prompt: 'Dev prompt',
                mode: TaskMode.EXECUTION,
                additionalContextInput: '{"dev": true}',
            });
        });

        it('should use empty defaults when environment variables are not set in development mode', () => {
            // Arrange
            delete process.env.PROMPT;
            delete process.env.MODE;
            delete process.env.ADDITIONAL_CONTEXT;

            // Act
            const result = (inputProvider as any).getRawInputs();

            // Assert
            expect(result).toEqual({
                prompt: '',
                mode: undefined,
                additionalContextInput: '{}',
            });
        });
    });

    describe('getRawInputs - Production Mode', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'production';
            inputProvider = new InputProvider();
        });

        it('should get inputs from Azure DevOps task library in production mode', () => {
            // Arrange
            mockGetInput
                .mockReturnValueOnce('Azure DevOps prompt')
                .mockReturnValueOnce(TaskMode.DECISION)
                .mockReturnValueOnce('{"azure": true}');

            // Act
            const result = (inputProvider as any).getRawInputs();

            // Assert
            expect(result).toEqual({
                prompt: 'Azure DevOps prompt',
                mode: TaskMode.DECISION,
                additionalContextInput: '{"azure": true}',
            });

            expect(mockGetInput).toHaveBeenCalledWith('prompt', true);
            expect(mockGetInput).toHaveBeenCalledWith('mode', true);
            expect(mockGetInput).toHaveBeenCalledWith('additionalContext', false);
        });

        it('should use empty defaults when task library returns undefined in production mode', () => {
            // Arrange
            mockGetInput.mockReturnValue(undefined);

            // Act
            const result = (inputProvider as any).getRawInputs();

            // Assert
            expect(result).toEqual({
                prompt: '',
                mode: undefined,
                additionalContextInput: '{}',
            });
        });
    });
});
