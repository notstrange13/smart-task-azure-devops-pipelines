import { ToolResult } from '../../../src/types/tool';

describe('Tool Types', () => {
    describe('ToolResult interface', () => {
        it('should accept successful tool result', () => {
            const result: ToolResult = {
                name: 'test-tool',
                result: { data: 'success data' },
                success: true,
            };

            expect(result.name).toBe('test-tool');
            expect(result.result).toEqual({ data: 'success data' });
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept failed tool result with error', () => {
            const result: ToolResult = {
                name: 'failing-tool',
                result: null,
                success: false,
                error: 'Tool execution failed due to invalid parameters',
            };

            expect(result.name).toBe('failing-tool');
            expect(result.result).toBeNull();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Tool execution failed due to invalid parameters');
        });

        it('should accept tool result with various result types', () => {
            const stringResult: ToolResult = {
                name: 'string-tool',
                result: 'simple string result',
                success: true,
            };

            const numberResult: ToolResult = {
                name: 'number-tool',
                result: 42,
                success: true,
            };

            const arrayResult: ToolResult = {
                name: 'array-tool',
                result: [1, 2, 3, 'test'],
                success: true,
            };

            const objectResult: ToolResult = {
                name: 'object-tool',
                result: { key: 'value', nested: { deep: 'data' } },
                success: true,
            };

            expect(stringResult.result).toBe('simple string result');
            expect(numberResult.result).toBe(42);
            expect(arrayResult.result).toEqual([1, 2, 3, 'test']);
            expect(objectResult.result).toEqual({ key: 'value', nested: { deep: 'data' } });
        });

        it('should work with undefined and null results', () => {
            const undefinedResult: ToolResult = {
                name: 'undefined-tool',
                result: undefined,
                success: true,
            };

            const nullResult: ToolResult = {
                name: 'null-tool',
                result: null,
                success: false,
                error: 'No data returned',
            };

            expect(undefinedResult.result).toBeUndefined();
            expect(nullResult.result).toBeNull();
        });

        it('should handle boolean results', () => {
            const trueResult: ToolResult = {
                name: 'validation-tool',
                result: true,
                success: true,
            };

            const falseResult: ToolResult = {
                name: 'check-tool',
                result: false,
                success: true,
            };

            expect(trueResult.result).toBe(true);
            expect(falseResult.result).toBe(false);
        });

        it('should support complex nested data structures', () => {
            const complexResult: ToolResult = {
                name: 'complex-analysis-tool',
                result: {
                    status: 'completed',
                    data: {
                        users: [
                            { id: 1, name: 'John', active: true },
                            { id: 2, name: 'Jane', active: false },
                        ],
                        metadata: {
                            processed: 2,
                            timestamp: '2025-09-09T12:00:00Z',
                            tags: ['analysis', 'users', 'report'],
                        },
                        summary: {
                            total: 2,
                            active: 1,
                            inactive: 1,
                            percentage: {
                                active: 50.0,
                                inactive: 50.0,
                            },
                        },
                    },
                },
                success: true,
            };

            expect(complexResult.result.status).toBe('completed');
            expect(complexResult.result.data.users).toHaveLength(2);
            expect(complexResult.result.data.metadata.processed).toBe(2);
            expect(complexResult.result.data.summary.percentage.active).toBe(50.0);
        });

        it('should handle error field as optional', () => {
            const successWithoutError: ToolResult = {
                name: 'success-tool',
                result: 'success',
                success: true,
            };

            const successWithError: ToolResult = {
                name: 'warning-tool',
                result: 'partial success',
                success: true,
                error: 'Warning: some data was incomplete',
            };

            const failureWithError: ToolResult = {
                name: 'failure-tool',
                result: null,
                success: false,
                error: 'Complete failure occurred',
            };

            const failureWithoutError: ToolResult = {
                name: 'silent-failure-tool',
                result: null,
                success: false,
            };

            expect(successWithoutError.error).toBeUndefined();
            expect(successWithError.error).toBe('Warning: some data was incomplete');
            expect(failureWithError.error).toBe('Complete failure occurred');
            expect(failureWithoutError.error).toBeUndefined();
        });

        it('should work with tool names containing special characters', () => {
            const specialNameResult: ToolResult = {
                name: 'my-tool_v2.0',
                result: 'worked',
                success: true,
            };

            const namespaceResult: ToolResult = {
                name: 'namespace::tool::action',
                result: { executed: true },
                success: true,
            };

            expect(specialNameResult.name).toBe('my-tool_v2.0');
            expect(namespaceResult.name).toBe('namespace::tool::action');
        });

        it('should support empty string tool names', () => {
            const emptyNameResult: ToolResult = {
                name: '',
                result: 'anonymous tool result',
                success: true,
            };

            expect(emptyNameResult.name).toBe('');
            expect(emptyNameResult.result).toBe('anonymous tool result');
        });
    });

    describe('Type Guards', () => {
        it('should work with custom type guard for ToolResult', () => {
            const isToolResult = (obj: any): obj is ToolResult => {
                return (
                    typeof obj === 'object' &&
                    obj !== null &&
                    typeof obj.name === 'string' &&
                    obj.hasOwnProperty('result') &&
                    typeof obj.success === 'boolean' &&
                    (obj.error === undefined || typeof obj.error === 'string')
                );
            };

            const validResult = {
                name: 'test-tool',
                result: 'test',
                success: true,
            };

            const validResultWithError = {
                name: 'test-tool',
                result: null,
                success: false,
                error: 'failed',
            };

            const invalidResult1 = {
                name: 'test-tool',
                // missing result
                success: true,
            };

            const invalidResult2 = {
                name: 123, // invalid type
                result: 'test',
                success: true,
            };

            expect(isToolResult(validResult)).toBe(true);
            expect(isToolResult(validResultWithError)).toBe(true);
            expect(isToolResult(invalidResult1)).toBe(false);
            expect(isToolResult(invalidResult2)).toBe(false);
            expect(isToolResult(null)).toBe(false);
            expect(isToolResult(undefined)).toBe(false);
            expect(isToolResult('string')).toBe(false);
        });
    });

    describe('Usage Patterns', () => {
        it('should support functional programming patterns', () => {
            const results: ToolResult[] = [
                { name: 'tool1', result: 'success', success: true },
                { name: 'tool2', result: null, success: false, error: 'failed' },
                { name: 'tool3', result: 42, success: true },
            ];

            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);
            const names = results.map(r => r.name);

            expect(successful).toHaveLength(2);
            expect(failed).toHaveLength(1);
            expect(names).toEqual(['tool1', 'tool2', 'tool3']);
        });

        it('should support result transformation', () => {
            const result: ToolResult = {
                name: 'data-processor',
                result: { items: [1, 2, 3], count: 3 },
                success: true,
            };

            const transformResult = (toolResult: ToolResult): any => {
                if (!toolResult.success) {
                    return null;
                }
                return toolResult.result;
            };

            const transformed = transformResult(result);
            expect(transformed).toEqual({ items: [1, 2, 3], count: 3 });
        });

        it('should support error handling patterns', () => {
            const handleToolResult = (result: ToolResult): string => {
                if (!result.success) {
                    return `Error in ${result.name}: ${result.error || 'Unknown error'}`;
                }
                return `${result.name} succeeded with result: ${JSON.stringify(result.result)}`;
            };

            const success: ToolResult = {
                name: 'processor',
                result: { status: 'done' },
                success: true,
            };

            const failure: ToolResult = {
                name: 'validator',
                result: null,
                success: false,
                error: 'Validation failed',
            };

            expect(handleToolResult(success)).toBe('processor succeeded with result: {"status":"done"}');
            expect(handleToolResult(failure)).toBe('Error in validator: Validation failed');
        });
    });
});
