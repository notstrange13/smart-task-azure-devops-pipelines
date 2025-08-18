import { Agent } from '../src/agent';
import { TaskContext, TaskMode, ModelType } from '../src/types';

describe('Agent', () => {
    const mockTaskContext: TaskContext = {
        input: {
            prompt: 'Test prompt for unit testing',
            mode: TaskMode.DECISION,
            additionalContext: {}
        },
        config: {
            modelType: ModelType.AZURE_OPENAI,
            modelConfig: {
                instanceName: 'test-instance',
                apiKey: 'test-key',
                deploymentName: 'gpt-4o'
            }
        }
    };

    it('should initialize properly', () => {
        const agent = new Agent(mockTaskContext);
        expect(agent).toBeDefined();
    });

    it('should handle empty context sources', async () => {
        const agent = new Agent(mockTaskContext);
        // This test would need proper mocking of Azure OpenAI
        // For now, just test instantiation
        expect(agent).toBeDefined();
    });
});
