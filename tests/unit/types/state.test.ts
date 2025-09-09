import { PlanExecuteState, StateAnnotation } from '../../../src/types/state';

describe('State Types', () => {
    describe('PlanExecuteState interface', () => {
        it('should accept valid state object', () => {
            const state: PlanExecuteState = {
                input: 'Test input',
                plan: ['step1', 'step2', 'step3'],
                past_steps: [
                    ['action1', 'result1'],
                    ['action2', 'result2'],
                ],
                response: 'Test response',
                context: { key: 'value' },
            };

            expect(state.input).toBe('Test input');
            expect(state.plan).toHaveLength(3);
            expect(state.past_steps).toHaveLength(2);
            expect(state.response).toBe('Test response');
            expect(state.context).toEqual({ key: 'value' });
        });

        it('should work with minimal required properties', () => {
            const state: PlanExecuteState = {
                input: 'Minimal input',
                plan: [],
                past_steps: [],
                context: {},
            };

            expect(state.input).toBe('Minimal input');
            expect(state.plan).toEqual([]);
            expect(state.past_steps).toEqual([]);
            expect(state.context).toEqual({});
            expect(state.response).toBeUndefined();
        });

        it('should handle optional response property', () => {
            const stateWithResponse: PlanExecuteState = {
                input: 'Input',
                plan: ['step'],
                past_steps: [],
                context: {},
                response: 'Response provided',
            };

            const stateWithoutResponse: PlanExecuteState = {
                input: 'Input',
                plan: ['step'],
                past_steps: [],
                context: {},
            };

            expect(stateWithResponse.response).toBe('Response provided');
            expect(stateWithoutResponse.response).toBeUndefined();
        });

        it('should work with complex past_steps structure', () => {
            const state: PlanExecuteState = {
                input: 'Complex input',
                plan: ['analyze', 'execute', 'validate'],
                past_steps: [
                    ['analyze requirements', 'requirements analyzed successfully'],
                    ['execute plan', 'plan executed with warnings'],
                    ['validate results', 'validation completed'],
                ],
                context: {
                    user: 'testuser',
                    sessionId: 'session-123',
                    metadata: { version: '1.0' },
                },
                response: 'All steps completed',
            };

            expect(state.past_steps).toHaveLength(3);
            expect(state.past_steps[0]).toEqual([
                'analyze requirements',
                'requirements analyzed successfully',
            ]);
            expect(state.past_steps[1]).toEqual(['execute plan', 'plan executed with warnings']);
            expect(state.past_steps[2]).toEqual(['validate results', 'validation completed']);
        });

        it('should work with complex context objects', () => {
            const complexContext = {
                user: { id: 123, name: 'John', role: 'admin' },
                project: { id: 'proj-456', name: 'Test Project' },
                settings: {
                    timeout: 30000,
                    retries: 3,
                    debug: true,
                },
                metadata: {
                    tags: ['urgent', 'automation'],
                    created: '2025-09-09',
                    nested: { deep: { value: 'test' } },
                },
            };

            const state: PlanExecuteState = {
                input: 'Complex context test',
                plan: ['setup', 'process', 'cleanup'],
                past_steps: [],
                context: complexContext,
            };

            expect(state.context.user.id).toBe(123);
            expect(state.context.project.name).toBe('Test Project');
            expect(state.context.settings.timeout).toBe(30000);
            expect(state.context.metadata.nested.deep.value).toBe('test');
        });
    });

    describe('StateAnnotation', () => {
        it('should exist as an exported value', () => {
            expect(StateAnnotation).toBeDefined();
            expect(typeof StateAnnotation).toBe('object');
        });

        it('should be a LangGraph annotation root', () => {
            // StateAnnotation should have the structure expected by LangGraph
            expect(StateAnnotation).toHaveProperty('spec');
            expect(StateAnnotation.spec).toBeDefined();
        });

        it('should be usable as a state annotation type', () => {
            // Test that StateAnnotation can be used in type contexts
            const annotationType = StateAnnotation;
            expect(annotationType).toBeDefined();

            // The annotation should be structured for LangGraph usage
            expect(typeof annotationType).toBe('object');
        });
    });
});
